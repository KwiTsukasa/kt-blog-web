def runCmd(String unixScript, String windowsScript = null) {
  if (isUnix()) {
    sh unixScript
  } else {
    bat(windowsScript ?: unixScript)
  }
}

def isPublishBranch(String branchName, String pattern) {
  return branchName ==~ pattern
}

pipeline {
  agent { label 'kt-node-agent' }

  options {
    skipDefaultCheckout(true)
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '10'))
  }

  parameters {
    booleanParam(name: 'DEPLOY_STATIC_FILES', defaultValue: true, description: '构建成功后是否发布 dist 到 Nginx 静态目录；仅发布分支生效')
    string(name: 'PUBLISH_BRANCH_PATTERN', defaultValue: '^(main|master|release/.+)$', description: '允许发布静态文件的分支正则')
    string(name: 'DEPLOY_TARGET_DIR', defaultValue: '/home/jenkins/agent/frontends/html/blog', description: 'Nginx 挂载目录中 blog-web 项目的静态文件目录')
    string(name: 'VITE_BASE', defaultValue: '/', description: '构建进 blog-web 的 Vite base 路径')
    string(name: 'VITE_BLOG_THEME_CONFIG_URL', defaultValue: '/api/blog/theme/config', description: 'Blog 主题配置接口')
    string(name: 'VITE_BLOG_ARTICLE_LIST_URL', defaultValue: '/api/blog/article/public/list', description: 'Blog 文章列表接口')
    string(name: 'VITE_BLOG_ARTICLE_DETAIL_URL', defaultValue: '/api/blog/article/public/detail', description: 'Blog 文章详情接口')
  }

  environment {
    CI = 'true'
    NODE_OPTIONS = '--max-old-space-size=4096'
    PNPM_VERSION = '10.28.2'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Prepare') {
      steps {
        script {
          env.IS_CHANGE_REQUEST = env.CHANGE_ID ? 'true' : 'false'
          def publishPattern = params.PUBLISH_BRANCH_PATTERN?.trim() ?: '^(main|master|release/.+)$'
          env.IS_PUBLISH_BRANCH = (!env.CHANGE_ID && isPublishBranch(env.BRANCH_NAME ?: '', publishPattern)) ? 'true' : 'false'

          if (isUnix()) {
            runCmd("""
              node --version
              if command -v corepack >/dev/null 2>&1; then
                corepack enable
                corepack prepare pnpm@${env.PNPM_VERSION} --activate
              fi
              if ! command -v pnpm >/dev/null 2>&1; then
                echo "pnpm or corepack is required on the Jenkins Agent."
                exit 1
              fi
              pnpm --version
            """.stripIndent())
          } else {
            runCmd('', """
              node --version
              where corepack >nul 2>nul
              if not errorlevel 1 (
                corepack enable
                corepack prepare pnpm@${env.PNPM_VERSION} --activate
              )
              where pnpm >nul 2>nul
              if errorlevel 1 exit /b 1
              pnpm --version
            """.stripIndent())
          }

          echo """
            Branch: ${env.BRANCH_NAME ?: '-'}
            Change request: ${env.CHANGE_ID ?: '-'}
            Publish branch: ${env.IS_PUBLISH_BRANCH}
            Deploy static files: ${params.DEPLOY_STATIC_FILES}
            Deploy target: ${params.DEPLOY_TARGET_DIR}
            Vite base: ${params.VITE_BASE}
            Theme config URL: ${params.VITE_BLOG_THEME_CONFIG_URL}
            Article list URL: ${params.VITE_BLOG_ARTICLE_LIST_URL}
            Article detail URL: ${params.VITE_BLOG_ARTICLE_DETAIL_URL}
          """.stripIndent()
        }
      }
    }

    stage('Install') {
      steps {
        script {
          runCmd('pnpm install --frozen-lockfile')
        }
      }
    }

    stage('Verify') {
      steps {
        script {
          runCmd('pnpm test:unit -- --run')
        }
      }
    }

    stage('Build') {
      steps {
        script {
          withEnv([
            "VITE_BASE=${params.VITE_BASE}",
            "VITE_BLOG_THEME_CONFIG_URL=${params.VITE_BLOG_THEME_CONFIG_URL}",
            "VITE_BLOG_ARTICLE_LIST_URL=${params.VITE_BLOG_ARTICLE_LIST_URL}",
            "VITE_BLOG_ARTICLE_DETAIL_URL=${params.VITE_BLOG_ARTICLE_DETAIL_URL}",
          ]) {
            runCmd('pnpm run build')
          }
        }
      }
    }

    stage('Deploy Static') {
      when {
        allOf {
          expression { return params.DEPLOY_STATIC_FILES }
          expression { return env.IS_CHANGE_REQUEST != 'true' }
          expression { return env.IS_PUBLISH_BRANCH == 'true' }
        }
      }
      steps {
        script {
          if (!isUnix()) {
            error('Deploy Static stage requires a Linux/NAS Jenkins Agent.')
          }

          def targetDir = params.DEPLOY_TARGET_DIR?.trim()
          if (!targetDir) {
            error('DEPLOY_TARGET_DIR is required when DEPLOY_STATIC_FILES is enabled.')
          }

          // 先发布到临时目录再替换目标目录，避免 Nginx 读到半复制状态。
          withEnv(["TARGET_DIR=${targetDir}"]) {
            runCmd("""
              set -e
              test -f dist/index.html

              case "\${TARGET_DIR}" in
                ""|"/"|"/home"|"/home/jenkins"|"/home/jenkins/agent"|"/usr"|"/usr/share"|"/usr/share/nginx"|"/usr/share/nginx/html")
                  echo "Unsafe DEPLOY_TARGET_DIR: \${TARGET_DIR}"
                  exit 1
                  ;;
              esac

              parent_dir=\$(dirname "\${TARGET_DIR}")
              release_dir="\${TARGET_DIR}.release-${env.BUILD_NUMBER}"
              previous_dir="\${TARGET_DIR}.previous"

              mkdir -p "\${parent_dir}"
              rm -rf "\${release_dir}" "\${previous_dir}"
              mkdir -p "\${release_dir}"
              cp -a dist/. "\${release_dir}/"

              if [ -d "\${TARGET_DIR}" ]; then
                mv "\${TARGET_DIR}" "\${previous_dir}"
              fi
              mv "\${release_dir}" "\${TARGET_DIR}"
              rm -rf "\${previous_dir}"

              find "\${TARGET_DIR}" -maxdepth 2 -type f | head
            """.stripIndent())
          }
        }
      }
    }
  }

  post {
    success {
      archiveArtifacts artifacts: 'dist/**,package.json,pnpm-lock.yaml,Jenkinsfile,deploy/**', fingerprint: true, allowEmptyArchive: true
    }
  }
}
