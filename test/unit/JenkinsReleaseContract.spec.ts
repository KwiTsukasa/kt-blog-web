import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const jenkinsfile = readFileSync(resolve(process.cwd(), 'Jenkinsfile'), 'utf8')

function extractBlockAfter(source: string, marker: string): string {
  const markerIndex = source.indexOf(marker)
  expect(markerIndex).toBeGreaterThanOrEqual(0)

  const openingBrace = source.indexOf('{', markerIndex + marker.length)
  expect(openingBrace).toBeGreaterThan(markerIndex)

  let depth = 0
  for (let index = openingBrace; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1
    if (source[index] === '}') depth -= 1
    if (depth === 0) return source.slice(openingBrace + 1, index)
  }

  throw new Error(`Unclosed block after ${marker}`)
}

function extractStage(name: string): string {
  return extractBlockAfter(jenkinsfile, `stage('${name}')`)
}

describe('Blog Jenkins release contract', () => {
  it('rejects stale publish parameters before dependency preparation', () => {
    const prepare = extractStage('Prepare')
    const contractIndex = prepare.indexOf('def releaseContract')
    const nodePreparationIndex = prepare.indexOf('node --version')

    expect(jenkinsfile).toContain("string(name: 'EXPECTED_SOURCE_COMMIT', defaultValue: ''")
    expect(prepare).toContain("'VITE_BASE': './'")
    expect(prepare).toContain("'VITE_KT_ADMIN_BASE_URL': '/admin/'")
    expect(prepare).toContain('params[parameterName] != expectedValue')
    expect(prepare).toContain('Release requires ${parameterName}=${expectedValue}.')
    expect(contractIndex).toBeGreaterThanOrEqual(0)
    expect(nodePreparationIndex).toBeGreaterThan(contractIndex)
  })

  it('allows production writes only from synchronized non-PR main', () => {
    const prepare = extractStage('Prepare')
    const scmCredentialScope = extractBlockAfter(
      prepare,
      "sshagent(credentials: ['github-ssh-kt-template'])",
    )
    const staticDeploy = extractStage('Deploy Static')
    const nginxDeploy = extractStage('Deploy Nginx Config')
    const releaseModeIndex = prepare.indexOf('env.IS_RELEASE_MODE = (')
    const nonPrIndex = prepare.indexOf('!env.CHANGE_ID', releaseModeIndex)
    const mainBranchIndex = prepare.indexOf("(env.BRANCH_NAME ?: '') == 'main'", releaseModeIndex)
    const releaseContractIndex = prepare.indexOf('def releaseContract')
    const releaseEligibility = prepare.slice(releaseModeIndex, releaseContractIndex)
    const remoteLookupIndex = prepare.indexOf(
      'git ls-remote --exit-code --heads origin refs/heads/main refs/heads/dev',
    )

    expect(prepare).toMatch(/expectedSourceCommit ==~ \/\[0-9a-f\]\{40\}\//)
    expect(prepare).toContain('def expectedSourceCommit = params.EXPECTED_SOURCE_COMMIT')
    expect(prepare).toContain("sh(script: 'git rev-parse HEAD', returnStdout: true).trim()")
    expect(prepare).toContain('if (checkedOutCommit != expectedSourceCommit)')
    expect(releaseModeIndex).toBeGreaterThanOrEqual(0)
    expect(nonPrIndex).toBeGreaterThan(releaseModeIndex)
    expect(nonPrIndex).toBeLessThan(releaseContractIndex)
    expect(mainBranchIndex).toBeGreaterThan(releaseModeIndex)
    expect(mainBranchIndex).toBeLessThan(releaseContractIndex)
    expect(releaseEligibility).not.toContain('env.IS_PUBLISH_BRANCH')
    expect(prepare).not.toContain("if (env.BRANCH_NAME == 'main')")
    expect(remoteLookupIndex).toBeGreaterThan(releaseContractIndex)
    expect(scmCredentialScope).toContain(
      'git ls-remote --exit-code --heads origin refs/heads/main refs/heads/dev',
    )
    expect(
      prepare.match(/git ls-remote --exit-code --heads origin refs\/heads\/main refs\/heads\/dev/g),
    ).toHaveLength(1)
    expect(prepare).toContain("remoteHeads['refs/heads/main'] != expectedSourceCommit")
    expect(prepare).toContain("remoteHeads['refs/heads/dev'] != expectedSourceCommit")
    expect(prepare).toContain(
      'Remote main/dev must both equal EXPECTED_SOURCE_COMMIT before release.',
    )
    expect(staticDeploy).toContain("expression { return env.IS_RELEASE_MODE == 'true' }")
    expect(nginxDeploy).toContain("expression { return env.IS_RELEASE_MODE == 'true' }")
    expect(staticDeploy).not.toContain('env.IS_PUBLISH_BRANCH')
    expect(nginxDeploy).not.toContain('env.IS_PUBLISH_BRANCH')
  })

  it('publishes the exact Blog nginx config atomically with verified rollback', () => {
    const deploy = extractStage('Deploy Nginx Config')
    const backupIndex = deploy.indexOf('backup_name=')
    const candidateIndex = deploy.indexOf('candidate_name=')
    const targetRegularIndex = deploy.indexOf("test -f '/conf.d/\\${target_name}'")
    const targetSymlinkIndex = deploy.indexOf("test ! -L '/conf.d/\\${target_name}'")
    const backupResidueIndex = deploy.indexOf("test ! -e '/conf.d/\\${backup_name}'")
    const backupSymlinkIndex = deploy.indexOf("test ! -L '/conf.d/\\${backup_name}'")
    const candidateResidueIndex = deploy.indexOf("test ! -e '/conf.d/\\${candidate_name}'")
    const candidateSymlinkIndex = deploy.indexOf("test ! -L '/conf.d/\\${candidate_name}'")
    const restoreResidueIndex = deploy.indexOf("test ! -e '/conf.d/\\${restore_name}'")
    const restoreSymlinkIndex = deploy.indexOf("test ! -L '/conf.d/\\${restore_name}'")
    const exclusiveBackupIndex = deploy.indexOf(
      "ln '/conf.d/\\${target_name}' '/conf.d/\\${backup_name}'",
    )
    const trapIndex = deploy.indexOf('trap rollback_config EXIT HUP INT TERM')
    const exclusiveCandidateIndex = deploy.indexOf("set -C; cat > '/conf.d/\\${candidate_name}'")
    const exclusiveRestoreIndex = deploy.indexOf(
      "ln '/conf.d/\\${backup_name}' '/conf.d/\\${restore_name}'",
    )
    const atomicRestoreIndex = deploy.indexOf(
      "mv '/conf.d/\\${restore_name}' '/conf.d/\\${target_name}'",
    )
    const atomicInstallIndex = deploy.indexOf(
      "mv '/conf.d/\\${candidate_name}' '/conf.d/\\${target_name}'",
    )
    const validationIndex = deploy.indexOf(
      'docker exec "\\${NGINX_CONTAINER_NAME}" nginx -t',
      atomicInstallIndex,
    )
    const reloadIndex = deploy.indexOf(
      'docker exec "\\${NGINX_CONTAINER_NAME}" nginx -s reload',
      validationIndex,
    )
    const hashReadbackIndex = deploy.indexOf('deployed_sha=')

    expect(jenkinsfile).toContain("booleanParam(name: 'DEPLOY_NGINX_CONFIG', defaultValue: true")
    expect(deploy).toContain('NGINX_CONFIG_SOURCE=deploy/nginx-blog.conf')
    expect(deploy).toContain('rollback_config()')
    expect(deploy).toContain('trap rollback_config EXIT HUP INT TERM')
    expect(deploy).toContain("ln '/conf.d/\\${backup_name}' '/conf.d/\\${restore_name}'")
    expect(deploy).toContain("mv '/conf.d/\\${restore_name}' '/conf.d/\\${target_name}'")
    expect(deploy).not.toContain("cp '/conf.d/\\${target_name}' '/conf.d/\\${backup_name}'")
    expect(deploy).not.toContain("cp '/conf.d/\\${backup_name}' '/conf.d/\\${restore_name}'")
    expect(deploy).not.toContain("rm -f '/conf.d/\\${backup_name}'")
    expect(deploy.match(/nginx -t/g)?.length).toBeGreaterThanOrEqual(2)
    expect(deploy.match(/nginx -s reload/g)?.length).toBeGreaterThanOrEqual(2)
    expect(deploy).toContain('source_sha=')
    expect(deploy).toContain('backup_sha=')
    expect(deploy).toContain('candidate_sha=')
    expect(deploy).toContain('restored_sha=')
    expect(deploy).toContain('deployed_sha=')
    expect(deploy).toContain('Deployed Nginx config hash does not match the repository source.')
    expect(backupIndex).toBeGreaterThanOrEqual(0)
    expect(candidateIndex).toBeGreaterThan(backupIndex)
    expect(targetRegularIndex).toBeGreaterThan(candidateIndex)
    expect(targetSymlinkIndex).toBeGreaterThan(targetRegularIndex)
    expect(backupResidueIndex).toBeGreaterThan(targetSymlinkIndex)
    expect(backupSymlinkIndex).toBeGreaterThan(backupResidueIndex)
    expect(candidateResidueIndex).toBeGreaterThan(backupSymlinkIndex)
    expect(candidateSymlinkIndex).toBeGreaterThan(candidateResidueIndex)
    expect(restoreResidueIndex).toBeGreaterThan(candidateSymlinkIndex)
    expect(restoreSymlinkIndex).toBeGreaterThan(restoreResidueIndex)
    expect(exclusiveBackupIndex).toBeGreaterThan(restoreSymlinkIndex)
    expect(trapIndex).toBeGreaterThan(exclusiveBackupIndex)
    expect(exclusiveCandidateIndex).toBeGreaterThan(trapIndex)
    expect(atomicRestoreIndex).toBeGreaterThan(exclusiveRestoreIndex)
    expect(atomicInstallIndex).toBeGreaterThan(candidateIndex)
    expect(atomicInstallIndex).toBeGreaterThan(exclusiveCandidateIndex)
    expect(validationIndex).toBeGreaterThan(atomicInstallIndex)
    expect(reloadIndex).toBeGreaterThan(validationIndex)
    expect(hashReadbackIndex).toBeGreaterThan(reloadIndex)
  })
})
