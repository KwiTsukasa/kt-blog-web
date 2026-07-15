export interface Cubism2PhysicsMath {
  DEGREES_TO_RADIANS: number
}

export interface CreateCubism2PhysicsHairOptions {
  Cubism2Math: Cubism2PhysicsMath
  isBootstrapping: () => boolean
}

interface Cubism2PhysicsModel {
  getParamFloat: (paramId: unknown) => number
  setParamFloat: (paramId: unknown, value: number, weight: number | null) => void
}

interface Cubism2PhysicsPointInstance {
  accelerationX: number
  accelerationY: number
  capturePreviousState: () => void
  forceX: number
  forceY: number
  mass: number
  previousVelocityX: number
  previousVelocityY: number
  previousX: number
  previousY: number
  velocityX: number
  velocityY: number
  x: number
  y: number
}

interface Cubism2PhysicsHairInstance {
  addSrcParam: (sourceKind: string, paramId: unknown, scale: number, weight: number | null) => void
  addTargetParam: (
    targetKind: string,
    paramId: unknown,
    scale: number,
    weight: number | null,
  ) => void
  airResistance: number
  angularVelocityDegreesPerSecond: number
  calculateCurrentAngleDegrees: () => number
  currentAngleDegrees: number
  firstUpdateTimeMillis: number
  getAngularVelocityDegreesPerSecond: () => number
  getCurrentAngleDegrees: () => number
  getGravityAngleDegrees: () => number
  getPhysicsPoint1: () => Cubism2PhysicsPointInstance
  getPhysicsPoint2: () => Cubism2PhysicsPointInstance
  gravityAngleDegrees: number
  integratePhysicsPoints: (model: Cubism2PhysicsModel, deltaSeconds: number) => void
  childPoint: Cubism2PhysicsPointInstance
  previousAngleDegrees: number
  previousUpdateTimeMillis: number
  restLength: number
  rootPoint: Cubism2PhysicsPointInstance
  setGravityAngleDegrees: (gravityAngleDegrees: number) => void
  sourceParamBindings: Cubism2SourceParamBindingInstance[]
  setup: (restLength?: number, airResistance?: number, mass?: number) => void
  targetParamBindings: Cubism2TargetParamBindingInstance[]
  update: (model: Cubism2PhysicsModel, userTimeMillis: number) => void
}

interface Cubism2SourceParamBindingInstance {
  applySourceParameter: (model: Cubism2PhysicsModel, hair: Cubism2PhysicsHairInstance) => void
  paramId: unknown
  scale: number
  sourceKind?: string
  weight: number | null
}

interface Cubism2TargetParamBindingInstance {
  paramId: unknown
  scale: number
  targetKind?: string
  weight: number | null
  writeTargetParameter: (model: Cubism2PhysicsModel, hair: Cubism2PhysicsHairInstance) => void
}

type Cubism2PhysicsHairConstructor = {
  new (): Cubism2PhysicsHairInstance
  Source: {
    new (): Record<string, never>
    TO_GRAVITY_ANGLE: string
    TO_ROOT_X: string
    TO_ROOT_Y: string
  }
  Target: {
    new (): Record<string, never>
    FROM_ANGLE: string
    FROM_ANGULAR_VELOCITY: string
  }
  prototype: Cubism2PhysicsHairInstance
}

/**
 * Creates the Cubism2 hair-physics helper from the min.js source with readable force integration names.
 * @param options Math constants and bootstrap state supplied by the runtime Core composition.
 * @returns Legacy `PhysicsHair` constructor with source/target binding namespaces.
 */
export function createCubism2PhysicsHair(
  options: CreateCubism2PhysicsHairOptions,
): Cubism2PhysicsHairConstructor {
  const { Cubism2Math, isBootstrapping } = options

  /**
   * Simulates a two-point spring hair chain and maps it to Cubism2 model parameters.
   */
  function PhysicsHair(this: Cubism2PhysicsHairInstance): void {
    if (isBootstrapping()) {
      return
    }
    this.rootPoint = new (PhysicsPoint as unknown as new () => Cubism2PhysicsPointInstance)()
    this.childPoint = new (PhysicsPoint as unknown as new () => Cubism2PhysicsPointInstance)()
    this.restLength = 0
    this.gravityAngleDegrees = 0
    this.airResistance = 0
    this.currentAngleDegrees = 0
    this.previousAngleDegrees = 0
    this.angularVelocityDegreesPerSecond = 0
    this.firstUpdateTimeMillis = 0
    this.previousUpdateTimeMillis = 0
    this.sourceParamBindings = []
    this.targetParamBindings = []
    this.setup(0.3, 0.5, 0.1)
  }

  const Hair = PhysicsHair as unknown as Cubism2PhysicsHairConstructor

  /**
   * Configures the initial hair link length, drag coefficient, and mass.
   * @param restLength Rest length between the root and child point.
   * @param airResistance Drag coefficient applied to the child point velocity.
   * @param mass Mass shared by the root and child points.
   */
  Hair.prototype.setup = function (restLength?: number, airResistance?: number, mass?: number): void {
    this.previousAngleDegrees = this.calculateCurrentAngleDegrees()
    this.childPoint.capturePreviousState()
    if (arguments.length === 3) {
      this.restLength = restLength!
      this.airResistance = airResistance!
      this.rootPoint.mass = mass!
      this.childPoint.mass = mass!
      this.childPoint.y = restLength!
      this.setup()
    }
  }

  /**
   * @returns Root physics point that receives model-source parameter offsets.
   */
  Hair.prototype.getPhysicsPoint1 = function (): Cubism2PhysicsPointInstance {
    return this.rootPoint
  }

  /**
   * @returns Child physics point whose angle drives target parameters.
   */
  Hair.prototype.getPhysicsPoint2 = function (): Cubism2PhysicsPointInstance {
    return this.childPoint
  }

  /**
   * Reads the gravity angle used during the next force integration.
   * @returns Gravity angle in degrees.
   */
  Hair.prototype.getGravityAngleDegrees = function (): number {
    return this.gravityAngleDegrees
  }

  /**
   * Updates the gravity angle accumulated from source parameters.
   * @param gravityAngleDegrees Gravity angle in degrees.
   */
  Hair.prototype.setGravityAngleDegrees = function (gravityAngleDegrees: number): void {
    this.gravityAngleDegrees = gravityAngleDegrees
  }

  /**
   * @returns Current child-point angle in degrees.
   */
  Hair.prototype.getCurrentAngleDegrees = function (): number {
    return this.currentAngleDegrees
  }

  /**
   * @returns Angular velocity in degrees per second.
   */
  Hair.prototype.getAngularVelocityDegreesPerSecond = function (): number {
    return this.angularVelocityDegreesPerSecond
  }

  /**
   * Calculates the current angle from the root point to the child point.
   * @returns Angle in degrees using the legacy Cubism2 coordinate system.
   */
  Hair.prototype.calculateCurrentAngleDegrees = function (): number {
    return (
      (-180 *
        Math.atan2(
          this.rootPoint.x - this.childPoint.x,
          -(this.rootPoint.y - this.childPoint.y),
        )) /
      Math.PI
    )
  }

  /**
   * Adds one input parameter binding that moves the root point or gravity angle.
   * @param sourceKind Source mapping mode from `PhysicsHair.Source`.
   * @param paramId Cubism2 parameter ID read from the model during update.
   * @param scale Scale applied to the source parameter value.
   * @param weight Blend weight used to smooth the source effect.
   */
  Hair.prototype.addSrcParam = function (
    sourceKind: string,
    paramId: unknown,
    scale: number,
    weight: number | null,
  ): void {
    const binding = new (SourceParamBinding as unknown as new (
      sourceKind: string,
      paramId: unknown,
      scale: number,
      weight: number | null,
    ) => Cubism2SourceParamBindingInstance)(sourceKind, paramId, scale, weight)
    this.sourceParamBindings.push(binding)
  }

  /**
   * Adds one output parameter binding driven by the simulated angle or angular velocity.
   * @param targetKind Target mapping mode from `PhysicsHair.Target`.
   * @param paramId Cubism2 parameter ID written after physics integration.
   * @param scale Scale applied to the simulated output value.
   * @param weight Blend weight passed to the target model parameter setter.
   */
  Hair.prototype.addTargetParam = function (
    targetKind: string,
    paramId: unknown,
    scale: number,
    weight: number | null,
  ): void {
    const binding = new (TargetParamBinding as unknown as new (
      targetKind: string,
      paramId: unknown,
      scale: number,
      weight: number | null,
    ) => Cubism2TargetParamBindingInstance)(targetKind, paramId, scale, weight)
    this.targetParamBindings.push(binding)
  }

  /**
   * Advances hair physics and writes all configured target parameters.
   * @param model Cubism2 model adapter exposing parameter read/write methods.
   * @param userTimeMillis Current user time in milliseconds.
   */
  Hair.prototype.update = function (model: Cubism2PhysicsModel, userTimeMillis: number): void {
    if (this.firstUpdateTimeMillis === 0) {
      this.firstUpdateTimeMillis = this.previousUpdateTimeMillis = userTimeMillis
      this.restLength = Math.sqrt(
        (this.rootPoint.x - this.childPoint.x) * (this.rootPoint.x - this.childPoint.x) +
          (this.rootPoint.y - this.childPoint.y) * (this.rootPoint.y - this.childPoint.y),
      )
      return
    }
    const deltaSeconds = (userTimeMillis - this.previousUpdateTimeMillis) / 1000
    if (deltaSeconds !== 0) {
      for (let sourceIndex = this.sourceParamBindings.length - 1; sourceIndex >= 0; --sourceIndex) {
        const sourceBinding = this.sourceParamBindings[sourceIndex]!
        sourceBinding.applySourceParameter(model, this)
      }
      this.integratePhysicsPoints(model, deltaSeconds)
      this.currentAngleDegrees = this.calculateCurrentAngleDegrees()
      this.angularVelocityDegreesPerSecond =
        (this.currentAngleDegrees - this.previousAngleDegrees) / deltaSeconds
      this.previousAngleDegrees = this.currentAngleDegrees
    }
    for (let targetIndex = this.targetParamBindings.length - 1; targetIndex >= 0; --targetIndex) {
      const targetBinding = this.targetParamBindings[targetIndex]!
      targetBinding.writeTargetParameter(model, this)
    }
    this.previousUpdateTimeMillis = userTimeMillis
  }

  /**
   * Runs one force-integration step for the two-point hair chain.
   * @param _model Cubism2 model adapter retained for legacy signature compatibility.
   * @param deltaSeconds Elapsed seconds between the current and previous update.
   */
  Hair.prototype.integratePhysicsPoints = function (
    _model: Cubism2PhysicsModel,
    deltaSeconds: number,
  ): void {
    if (deltaSeconds < 0.033) {
      deltaSeconds = 0.033
    }
    const inverseDelta = 1 / deltaSeconds
    this.rootPoint.velocityX = (this.rootPoint.x - this.rootPoint.previousX) * inverseDelta
    this.rootPoint.velocityY = (this.rootPoint.y - this.rootPoint.previousY) * inverseDelta
    this.rootPoint.accelerationX =
      (this.rootPoint.velocityX - this.rootPoint.previousVelocityX) * inverseDelta
    this.rootPoint.accelerationY =
      (this.rootPoint.velocityY - this.rootPoint.previousVelocityY) * inverseDelta
    this.rootPoint.forceX = this.rootPoint.accelerationX * this.rootPoint.mass
    this.rootPoint.forceY = this.rootPoint.accelerationY * this.rootPoint.mass
    this.rootPoint.capturePreviousState()

    const hairAngleRadians = -Math.atan2(
      this.rootPoint.y - this.childPoint.y,
      this.rootPoint.x - this.childPoint.x,
    )
    const sinAngle = Math.sin(hairAngleRadians)
    const cosAngle = Math.cos(hairAngleRadians)
    const gravityForce = 9.8 * this.childPoint.mass
    const gravityAngleRadians = this.gravityAngleDegrees * Cubism2Math.DEGREES_TO_RADIANS
    const projectedGravity = gravityForce * Math.cos(hairAngleRadians - gravityAngleRadians)
    const gravityForceX = projectedGravity * sinAngle
    const gravityForceY = projectedGravity * cosAngle
    const rootForceX = -this.rootPoint.forceX * sinAngle * sinAngle
    const rootForceY = -this.rootPoint.forceY * sinAngle * cosAngle
    const dragForceX = -this.childPoint.velocityX * this.airResistance
    const dragForceY = -this.childPoint.velocityY * this.airResistance

    this.childPoint.forceX = gravityForceX + rootForceX + dragForceX
    this.childPoint.forceY = gravityForceY + rootForceY + dragForceY
    this.childPoint.accelerationX = this.childPoint.forceX / this.childPoint.mass
    this.childPoint.accelerationY = this.childPoint.forceY / this.childPoint.mass
    this.childPoint.velocityX += this.childPoint.accelerationX * deltaSeconds
    this.childPoint.velocityY += this.childPoint.accelerationY * deltaSeconds
    this.childPoint.x += this.childPoint.velocityX * deltaSeconds
    this.childPoint.y += this.childPoint.velocityY * deltaSeconds

    const currentLength = Math.sqrt(
      (this.rootPoint.x - this.childPoint.x) * (this.rootPoint.x - this.childPoint.x) +
        (this.rootPoint.y - this.childPoint.y) * (this.rootPoint.y - this.childPoint.y),
    )
    this.childPoint.x =
      this.rootPoint.x +
      (this.restLength * (this.childPoint.x - this.rootPoint.x)) / currentLength
    this.childPoint.y =
      this.rootPoint.y +
      (this.restLength * (this.childPoint.y - this.rootPoint.y)) / currentLength
    this.childPoint.velocityX =
      (this.childPoint.x - this.childPoint.previousX) * inverseDelta
    this.childPoint.velocityY =
      (this.childPoint.y - this.childPoint.previousY) * inverseDelta
    this.childPoint.capturePreviousState()
  }

  /**
   * Mutable point state used by the two-point spring integration.
   */
  function PhysicsPoint(this: Cubism2PhysicsPointInstance): void {
    this.mass = 1
    this.x = 0
    this.y = 0
    this.velocityX = 0
    this.velocityY = 0
    this.accelerationX = 0
    this.accelerationY = 0
    this.forceX = 0
    this.forceY = 0
    this.previousX = 0
    this.previousY = 0
    this.previousVelocityX = 0
    this.previousVelocityY = 0
  }

  /**
   * Stores the previous position and velocity used to derive velocity/acceleration next frame.
   */
  PhysicsPoint.prototype.capturePreviousState = function (): void {
    this.previousX = this.x
    this.previousY = this.y
    this.previousVelocityX = this.velocityX
    this.previousVelocityY = this.velocityY
  }

  /**
   * Base source binding that stores a Cubism2 parameter read plus scale and smoothing weight.
   * @param paramId Cubism2 parameter ID read from the model.
   * @param scale Scale applied to the source parameter value.
   * @param weight Smoothing weight for applying the source value.
   */
  function SourceBindingBase(
    this: Cubism2SourceParamBindingInstance,
    paramId: unknown,
    scale: number,
    weight: number | null,
  ): void {
    this.paramId = paramId
    this.scale = scale
    this.weight = weight
  }

  /**
   * No-op source binding entry retained for prototype compatibility.
   * @param _model Cubism2 model adapter.
   * @param _hair Hair physics instance.
   */
  SourceBindingBase.prototype.applySourceParameter = function (
    _model: Cubism2PhysicsModel,
    _hair: Cubism2PhysicsHairInstance,
  ): void {}

  /**
   * Source binding that maps a model parameter into root X/Y or gravity angle.
   * @param sourceKind Source mapping mode from `PhysicsHair.Source`.
   * @param paramId Cubism2 parameter ID read from the model.
   * @param scale Scale applied to the source parameter value.
   * @param weight Smoothing weight for applying the source value.
   */
  function SourceParamBinding(
    this: Cubism2SourceParamBindingInstance,
    sourceKind: string,
    paramId: unknown,
    scale: number,
    weight: number | null,
  ): void {
    SourceBindingBase.prototype.constructor.call(this, paramId, scale, weight)
    this.sourceKind = sourceKind
  }

  SourceParamBinding.prototype =
    new (SourceBindingBase as unknown as new () => Cubism2SourceParamBindingInstance)()

  /**
   * Applies one source parameter to the hair root point or gravity angle.
   * @param model Cubism2 model adapter supplying the source parameter value.
   * @param hair Hair physics instance receiving the source effect.
   */
  SourceParamBinding.prototype.applySourceParameter = function (
    model: Cubism2PhysicsModel,
    hair: Cubism2PhysicsHairInstance,
  ): void {
    const sourceValue = this.scale * model.getParamFloat(this.paramId)
    const rootPoint = hair.getPhysicsPoint1()
    switch (this.sourceKind) {
      default:
      case Hair.Source.TO_ROOT_X:
        rootPoint.x += (sourceValue - rootPoint.x) * this.weight!
        break
      case Hair.Source.TO_ROOT_Y:
        rootPoint.y += (sourceValue - rootPoint.y) * this.weight!
        break
      case Hair.Source.TO_GRAVITY_ANGLE: {
        let gravityAngleDegrees = hair.getGravityAngleDegrees()
        gravityAngleDegrees += (sourceValue - gravityAngleDegrees) * this.weight!
        hair.setGravityAngleDegrees(gravityAngleDegrees)
        break
      }
    }
  }

  /**
   * Base target binding that stores a Cubism2 parameter write plus scale and smoothing weight.
   * @param paramId Cubism2 parameter ID written to the model.
   * @param scale Scale applied to the target physics value.
   * @param weight Blend weight passed to `setParamFloat`.
   */
  function TargetBindingBase(
    this: Cubism2TargetParamBindingInstance,
    paramId: unknown,
    scale: number,
    weight: number | null,
  ): void {
    this.paramId = paramId
    this.scale = scale
    this.weight = weight
  }

  /**
   * No-op target binding entry retained for prototype compatibility.
   * @param _model Cubism2 model adapter.
   * @param _hair Hair physics instance.
   */
  TargetBindingBase.prototype.writeTargetParameter = function (
    _model: Cubism2PhysicsModel,
    _hair: Cubism2PhysicsHairInstance,
  ): void {}

  /**
   * Target binding that writes simulated angle or angular velocity to one model parameter.
   * @param targetKind Target mapping mode from `PhysicsHair.Target`.
   * @param paramId Cubism2 parameter ID written to the model.
   * @param scale Scale applied to the target physics value.
   * @param weight Blend weight passed to `setParamFloat`.
   */
  function TargetParamBinding(
    this: Cubism2TargetParamBindingInstance,
    targetKind: string,
    paramId: unknown,
    scale: number,
    weight: number | null,
  ): void {
    TargetBindingBase.prototype.constructor.call(this, paramId, scale, weight)
    this.targetKind = targetKind
  }

  TargetParamBinding.prototype =
    new (TargetBindingBase as unknown as new () => Cubism2TargetParamBindingInstance)()

  /**
   * Writes one simulated output value to the target model parameter.
   * @param model Cubism2 model adapter receiving the target value.
   * @param hair Hair physics instance supplying angle outputs.
   */
  TargetParamBinding.prototype.writeTargetParameter = function (
    model: Cubism2PhysicsModel,
    hair: Cubism2PhysicsHairInstance,
  ): void {
    switch (this.targetKind) {
      default:
      case Hair.Target.FROM_ANGLE:
        model.setParamFloat(this.paramId, this.scale * hair.getCurrentAngleDegrees(), this.weight)
        break
      case Hair.Target.FROM_ANGULAR_VELOCITY:
        model.setParamFloat(
          this.paramId,
          this.scale * hair.getAngularVelocityDegreesPerSecond(),
          this.weight,
        )
        break
    }
  }

  /**
   * Installs the callable source-binding namespace directly on `PhysicsHair.Source`.
   * @returns Nothing; namespace instances carry no state.
   */
  Hair.Source = function PhysicsHairSourceNamespace(): void {} as unknown as Cubism2PhysicsHairConstructor['Source']
  Hair.Source.TO_ROOT_X = 'TO_ROOT_X'
  Hair.Source.TO_ROOT_Y = 'TO_ROOT_Y'
  Hair.Source.TO_GRAVITY_ANGLE = 'TO_GRAVITY_ANGLE'

  /**
   * Installs the callable target-binding namespace directly on `PhysicsHair.Target`.
   * @returns Nothing; namespace instances carry no state.
   */
  Hair.Target = function PhysicsHairTargetNamespace(): void {} as unknown as Cubism2PhysicsHairConstructor['Target']
  Hair.Target.FROM_ANGLE = 'FROM_ANGLE'
  Hair.Target.FROM_ANGULAR_VELOCITY = 'FROM_ANGULAR_VELOCITY'

  return Hair
}
