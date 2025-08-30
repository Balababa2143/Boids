export * as Dollmaker from './Dollmaker'
// export { HardLightVariant, GetHardLightVariant } from './Dollmaker'

export * as Boids from './Boids'
// export { HardLightVariant, GetHardLightVariant } from './Boids'

// # Debug
import * as Coordinater from '../../Coordinator'
import { ItemArchetype } from '../../Constant'
export const SetBlindStrength = (value?: number) =>
    Coordinater
        .SensoryControl
        .SetLimiterStrength(ItemArchetype.Visor, value ?? Math.random())