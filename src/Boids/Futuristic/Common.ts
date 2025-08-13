export const ModelSetRootDir = 'Boids/Futuristic'

export const ItemArchetype = {
    /**
     * Devices control both vision and audition.
     * 
     * @description
     *  Until the game split head items, both
     *  visor and headphones belong to this slot.
     */
    HeadSet: '{471F4425-6F9B-4E56-B151-23C7F0C13C10}',

    //TODO: Experiment with controlling character expression
    /**
     * Muzzle, face maks, and face harnesses.
     * @description
     *  Use mouth slot. 
     *  Mount on face, usually provide socket for oral device.
     */
    FaceCover: '{3EA1CEB4-213B-4CCC-A658-1007D5C9D49C}',

    /**
     * Devices that fills the mouth.
     * @description
     *  Use mouth slot.
     */
    OralDevice: '{3EA1CEB4-213B-4CCC-A658-1007D5C9D49C}'
}

// TODO: Write a event that debuff player combat capability if pose is selected

export const RequireSocket =
    (sockets: Iterable<string>) =>
    <RestraintTemplate extends Partial<restraint>>
    (template: RestraintTemplate) => ({
        ...template,
        requireAllTagsToEquip: [
            ...(function* () {
                for (const tag of template.requireAllTagsToEquip ?? []) {
                    yield tag
                }
                for (const tag of sockets) {
                    yield tag
                }
            })()
        ],
        events: [
            ...(function* () {
                for (const event of template.events ?? []) {
                    yield event
                }
                for (const tag of sockets) {
                    yield <KinkyDungeonEvent>{
                        trigger: 'postRemoval',
                        type: 'RequireTag',
                        requiredTag: tag,
                        inheritLinked: true
                    }
                }
            })()
        ]
    } satisfies Partial<restraint>)

export const SetGroup =
    (group: string) =>
    <RestraintTemplate extends Partial<restraint>>
    (template: RestraintTemplate) => ({
        ...template,
        Group: group
    } satisfies Partial<restraint>)

export const MechanichalLockSfx = {
    sfx: 'Mechlock',
    sfxRemove: 'MechUnlock'
} satisfies Partial<restraint>

export const InflateLockSfx = {
    sfx: 'MechPumpUp',
    sfxRemove: 'MechPumpRelease'
} satisfies Partial<restraint>

export const ElectricMechLockSfx = {
    sfx: 'FutureLock',
    sfxRemove: 'MechUnlock'
} satisfies Partial<restraint>
