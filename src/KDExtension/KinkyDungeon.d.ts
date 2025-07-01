import {Filter} from 'pixi.js'

declare global {
    let KDBaseRed: string;
    let KDBaseOrange: string;
    let KDBaseYellow: string;
    let KDBaseRibbon: string;
    let KDBasePink: string;
    let KDBaseLime: string;
    let KDBaseYellowGreen: string;
    let KDBasePurple: string;
    let KDBaseGreal: string;
    let KDBaseNeon: string;
    let KDBaseMint: string;
    let KDBaseLightGreen: string;
    let KDBaseForest: string;
    let KDBaseElectricBlue: string;
    let KDBaseCyan: string;
    let KDBaseTeal: string;
    let KDBaseLightBlue: string;
    let KDBaseBlue: string;
    let KDBaseBaby: string;
    let KDBaseWhite: string;
    let KDBaseBlack: string;
    let KDBaseLightGrey: string;
    interface String {
        replaceAt(index: number, character: string): string;
    }
    function parseInt(s: string | number, radix?: number): number;
    type MemoizedFunction<T extends Function> = T & {
        clearCache(): void;
    };
    interface WebGL2RenderingContext {
        program?: WebGLProgram;
        programFull?: WebGLProgram;
        programHalf?: WebGLProgram;
        textureCache?: Map<string, any>;
        maskCache?: Map<string, any>;
    }
    interface WebGLProgram {
        u_alpha?: WebGLUniformLocation;
        u_color?: WebGLUniformLocation;
        a_position?: number;
        a_texcoord?: number;
        u_matrix?: WebGLUniformLocation;
        u_texture?: WebGLUniformLocation;
        u_alpha_texture?: WebGLUniformLocation;
        position_buffer?: WebGLBuffer;
        texcoord_buffer?: WebGLBuffer;
    }
    interface HTMLCanvasElement {
        GL?: WebGL2RenderingContext;
    }
    interface HTMLImageElement {
        errorcount?: number;
    }
    interface HTMLElement {
        setAttribute(qualifiedName: string, value: string | number): void;
    }
    interface RGBColor {
        r: number;
        g: number;
        b: number;
    }
    interface RGBAColor extends RGBColor {
        a: number;
    }
    interface ItemBundle {
        Group: string;
        Name: string;
        Difficulty?: number;
        Color?: ItemColor;
        Property?: any;
        Craft?: any;
    }
    type AppearanceBundle = ItemBundle[];
    type ItemColor = string | string[];
    interface Item {
        Asset?: any;
        Model?: Model;
        Color?: ItemColor;
        Filters?: Record<string, LayerFilter>;
        Properties?: Record<string, LayerPropertiesType>;
        factionFilters?: Record<string, FactionFilterDef>;
        Difficulty?: number;
        Property?: any;
    }
    interface Character {
        ID: number;
        Name: string;
        Appearance: Item[];
        Pose: string[];
        Palette: string;
        metadata: KDOutfitMetadata;
        HeightRatio?: number;
        HeightModifier: number;
        MemberNumber?: number;
    }
    interface PlayerCharacter extends Character {
    }
    interface AssetOverrideHeight {
        Height: number;
        Priority: number;
        HeightRatioProportion?: number;
    }
    type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
    interface ICommand {
        Tag: string;
        Description?: string;
        Reference?: string;
        Action?: (this: Optional<ICommand, 'Tag'>, args: string, msg: string, parsed: string[]) => void;
        Prerequisite?: (this: Optional<ICommand, 'Tag'>) => boolean;
        AutoComplete?: (this: Optional<ICommand, 'Tag'>, parsed: string[], low: string, msg: string) => void;
        Clear?: false;
    }
    type AudioSoundEffect = [string, number];
    interface AudioEffect {
        Name: string;
        File: string | string[];
    }
    interface Window {
        WebFontConfig: object;
    }
    type Named = {
        name: string;
        inventoryVariant?: string;
    };
    interface NamedAndTyped extends Named {
        type?: string;
    }
    interface KDOutfitMetadata {
        name: string;
        palette: string;
        customColors: Record<string, Record<string, LayerFilter>>;
    }
    interface FactionFilterDef {
        color: string;
        override: boolean;
        desaturate?: boolean;
    }
    interface item extends NamedAndTyped {
        onEntity?: number;
        conjured?: boolean;
        id: number;
        linkCache?: string[];
        curse?: string;
        name: string;
        type?: string;
        faction?: string;
        forceFaction?: string;
        flags?: Record<string, number>;
        inventoryVariant?: string;
        events?: KinkyDungeonEvent[];
        quantity?: number;
        lock?: string;
        tetherToLeasher?: boolean;
        tetherToGuard?: boolean;
        tetherEntity?: number;
        tetherLocation?: {
            x: number;
            y: number;
        };
        tx?: number;
        ty?: number;
        tetherLength?: number;
        dynamicLink?: item;
        data?: Record<string, any>;
        pickProgress?: number;
        struggleProgress?: number;
        cutProgress?: number;
        unlockProgress?: number;
        attempts?: number;
        tightness?: number;
        trap?: string;
        showInQuickInv?: boolean;
    }
    interface consumable extends NamedAndTyped {
        name: string;
        range?: number;
        maxInventory?: number;
        sub?: number;
        rarity: number;
        isSubby?: boolean;
        sneakChance?: number;
        type: string;
        uniqueTags?: string[];
        shop?: boolean;
        spell?: string;
        potion?: boolean;
        latexsolvent?: number;
        noHands?: boolean;
        arousalMode?: boolean;
        data?: Record<string, string | number>;
        itemEffect?: string;
        contains?: string;
        prereq?: string;
        postreq?: string;
        gagFloor?: number;
        gagMax?: number;
        delay?: number;
        needMouth?: boolean;
        maxStrictness?: number;
        mp_instant?: number;
        mpool_instant?: number;
        wp_instant?: number;
        sp_instant?: number;
        ap_instant?: number;
        mp_gradual?: number;
        wp_gradual?: number;
        sp_gradual?: number;
        ap_gradual?: number;
        arousalRatio?: number;
        scaleWithMaxMP?: boolean;
        scaleWithMaxSP?: boolean;
        scaleWithMaxAP?: boolean;
        scaleWithMaxWP?: boolean;
        duration?: number;
        power?: number;
        amount?: number;
        rechargeCost?: number;
        aura?: string;
        buff?: string;
        costMod?: number;
        shrine?: string;
        sfx?: string;
        noConsumeOnUse?: boolean;
        useQuantity?: number;
        sideEffects?: string[];
    }
    type KDHasTags = {
        tags: any;
    };
    interface KDRestraintProps extends KDRestraintPropsBase {
        name: string;
        Group: string;
    }
    interface KDRestraintPropsBase {
        necklaceGagType?: string;
        Filters?: Record<string, LayerFilter>;
        Properties?: Record<string, LayerPropertiesType>;
        forceConjure?: boolean;
        factionFilters?: Record<string, FactionFilterDef>;
        noShrine?: boolean;
        good?: boolean;
        inventory?: boolean;
        power?: number;
        weight?: number;
        minLevel?: number;
        allFloors?: boolean;
        cloneTag?: string;
        escapeChance?: KDEscapeChanceList;
        events?: KinkyDungeonEvent[];
        enemyTags?: Record<string, number>;
        enemyTagsMult?: Record<string, number>;
        playerTags?: Record<string, number>;
        playerTagsMult?: Record<string, number>;
        playerTagsMissing?: Record<string, number>;
        playerTagsMissingMult?: Record<string, number>;
        shrine?: string[];
        debris?: string;
        debrisChance?: number;
        noRecover?: boolean;
        limited?: boolean;
        unlimited?: boolean;
        struggleBreak?: boolean;
        Security?: {
            level_key?: number;
            level_tech?: number;
            level_magic?: number;
        };
        npcBondageMult?: number;
        npcBondageType?: string;
        aggroLevel?: number;
        affinity?: {
            Struggle?: string[];
            Cut?: string[];
            Remove?: string[];
            Pick?: string[];
            Unlock?: string[];
        };
        alwaysEscapable?: string[];
        protection?: number;
        protectionCursed?: boolean;
        protectionTotal?: boolean;
        arousalMode?: boolean;
        accessible?: boolean;
        inaccessible?: boolean;
        deepAccessible?: boolean;
        alwaysAccessible?: boolean;
        alwaysInaccessible?: boolean;
        recycleresource?: Record<string, number>;
        renderWhenLinked?: string[];
        requireSingleTagToEquip?: string[];
        noRecycle?: boolean;
        disassembleAs?: string;
        disassembleCount?: number;
        requireAllTagsToEquip?: string[];
        alwaysRender?: boolean;
        renderExcept?: string[];
        changeRenderType?: Record<string, string>;
        linkPriority?: number;
        linkCategory?: string;
        linkSize?: number;
        linkCategories?: string[];
        linkSizes?: number[];
        noDupe?: boolean;
        ignoreNear?: boolean;
        ignoreSpells?: boolean;
        alwaysStruggleable?: boolean;
        Model?: string;
        Asset?: string;
        value?: number;
        AssetGroup?: string;
        hideTags?: string[];
        Color?: string[] | string;
        maxLevel?: number;
        floors?: Record<string, boolean>;
        helpChance?: {
            Struggle?: number;
            Cut?: number;
            Remove?: number;
            Pick?: number;
            Unlock?: number;
        };
        limitChance?: {
            Struggle?: number;
            Cut?: number;
            Remove?: number;
            Pick?: number;
            Unlock?: number;
        };
        speedMult?: {
            Struggle?: number;
            Cut?: number;
            Remove?: number;
            Pick?: number;
            Unlock?: number;
        };
        struggleMinSpeed?: {
            Struggle?: number;
            Cut?: number;
            Remove?: number;
            Pick?: number;
            Unlock?: number;
        };
        struggleMaxSpeed?: {
            Struggle?: number;
            Cut?: number;
            Remove?: number;
            Pick?: number;
            Unlock?: number;
        };
        struggleMult?: {
            Struggle?: number;
            Cut?: number;
            Remove?: number;
            Pick?: number;
            Unlock?: number;
        };
        limitMult?: {
            Struggle?: number;
            Cut?: number;
            Remove?: number;
            Pick?: number;
            Unlock?: number;
        };
        sfxEscape?: {
            Struggle?: string;
            Cut?: string;
            Remove?: string;
            Pick?: string;
            Unlock?: string;
            NoStamina?: string;
            NoWill?: string;
            NoMagic?: string;
            MagicCut?: string;
            PickBreak?: string;
            KnifeBreak?: string;
            KnifeDrop?: string;
            KeyDrop?: string;
            PickDrop?: string;
            Blocked?: string;
        };
        sfxFinishEscape?: {
            Struggle?: string;
            Cut?: string;
            Remove?: string;
            Pick?: string;
            Unlock?: string;
            Destroy?: string;
        };
        sfxRemove?: string;
        sfx?: string;
        sfxGroup?: string;
        linkedVibeTags?: string[];
        vibeLocation?: string;
        showInQuickInv?: boolean;
        chastity?: boolean;
        chastitybra?: boolean;
        piercing?: boolean;
        crotchrope?: boolean;
        plugSize?: number;
        bindarms?: boolean;
        restricthands?: number;
        bindhands?: number;
        harness?: boolean;
        hobble?: number;
        heelpower?: number;
        blockfeet?: boolean;
        restriction?: number;
        gag?: number;
        blindfold?: number;
        maxwill?: number;
        maxwillEnemy?: number;
        Type?: string;
        removePrison?: boolean;
        forceRemovePrison?: boolean;
        failSuffix?: Record<string, string>;
        customEquip?: string;
        customEscapeSucc?: string;
        specStruggleTypes?: string[];
        remove?: string[];
        removeShrine?: string[];
        slimeLevel?: number;
        addTag?: string[];
        addPose?: string[];
        noRenderPose?: string[];
        biggerVersion?: string;
        addPoseIfTopLevel?: string[];
        forbidPose?: string[];
        removePose?: string[];
        OverridePriority?: number;
        Modules?: number[];
        inventoryAs?: string;
        inventoryAsSelf?: string;
        alwaysKeep?: boolean;
        noJailRemove?: boolean;
        strictness?: number;
        strictnessZones?: string[];
        LinkableBy?: string[];
        DefaultLock?: string;
        HideDefaultLock?: boolean;
        Link?: string;
        UnLink?: string;
        removeOnLeash?: boolean;
        enclose?: boolean;
        ignoreIfNotLeash?: boolean;
        tether?: number;
        leash?: boolean;
        allowRemote?: boolean;
        escapeMult?: number;
        forceOutfit?: string;
        forceOutfitPriority?: number;
        alwaysDressModel?: alwaysDressModel[];
        bypass?: boolean;
        magic?: boolean;
        nonbinding?: boolean;
        binding?: boolean;
        freeze?: boolean;
        immobile?: boolean;
        trappable?: boolean;
        curse?: string;
        difficultyBonus?: number;
        divine?: boolean;
        potionCollar?: boolean;
        allowPotions?: boolean;
        slimeWalk?: boolean;
        soapWalk?: boolean;
        iceWalk?: boolean;
        enchantedDrain?: number;
        enchanted?: boolean;
        special?: boolean;
        factionColor?: number[][];
        armor?: boolean;
        LinkAll?: boolean;
        AlwaysLinkable?: boolean;
        UnderlinkedAlwaysRender?: boolean;
        NoLinkOver?: boolean;
        displayPower?: number;
    }
    interface restraint extends KDRestraintProps {
        power: number;
        preview?: string;
        quickBindCondition?: string;
        quickBindMult?: number;
        weight: number;
        minLevel: number;
        deaf?: number;
        Color?: string[] | string;
        tightType?: string;
        escapeChance: KDEscapeChanceList;
        enemyTags: Record<string, number>;
        enemyTagsMult?: Record<string, number>;
        playerTags: Record<string, number>;
        shrine: string[];
        ignoreFloorTags?: string[];
        ignoreMinLevelTags?: string[];
        ignoreMaxLevelTags?: string[];
        ApplyVariants?: Record<string, {
            weightMod: number;
            weightMult: number;
            playerTags?: Record<string, number>;
            playerTagsMult?: Record<string, number>;
            playerTagsMissing?: Record<string, number>;
            playerTagsMissingMult?: Record<string, number>;
            enemyTags: Record<string, number>;
            enemyTagsMult?: Record<string, number>;
        }>;
    }
    interface KDEscapeChanceList {
        Struggle?: number;
        Cut?: number;
        Remove?: number;
        Pick?: number;
        Unlock?: number;
    }
    type outfitKey = string;
    type mapKey = string;
    interface floorParams {
        successorPositive: Record<string, number>;
        successorNegative: Record<string, number>;
        successorSame: Record<string, number>;
        color: string;
        factionList?: string[];
        worldGenCode?: (coord: WorldCoord) => void;
        beforeWorldGenCode?: (coord: WorldCoord) => void;
        tagModifiers?: Record<string, number>;
        globalTags?: Record<string, boolean>;
        curseTags: string[];
        shadowColor?: number;
        lightColor?: number;
        background: string;
        openness: number;
        density: number;
        torchchance?: number;
        torchlitchance?: number;
        music: Record<string, number>;
        specialChests?: Record<string, number>;
        torchchanceboring?: number;
        torchreplace?: {
            sprite: string;
            unlitsprite?: string;
            brightness: number;
        };
        noReplace?: string;
        manaChance?: number;
        crackchance: number;
        foodChance?: number;
        barchance: number;
        brightness: number;
        chestcount: number;
        shrinecount: number;
        shrinechance: number;
        ghostchance: number;
        doorchance: number;
        nodoorchance: number;
        doorlockchance: number;
        doorlocktrapchance?: number;
        doortrapchance?: number;
        minortrapChance?: number;
        chargerchance?: number;
        litchargerchance?: number;
        chargercount?: number;
        trapchance: number;
        barrelChance?: number;
        grateChance: number;
        rubblechance: number;
        brickchance: number;
        cacheInterval: number;
        cageChance?: number;
        wallhookchance?: number;
        ceilinghookchance?: number;
        hallopenness?: number;
        forcePOI?: boolean;
        gaschance?: number;
        gasdensity?: number;
        gastype?: string;
        wallRubblechance?: number;
        lockmult?: number;
        floodchance?: number;
        forbiddenChance: number;
        forbiddenGreaterChance: number;
        setpieces?: {
            Type: string;
            Weight: number;
        }[];
        traps: {
            Name: string;
            Faction?: string;
            Enemy?: string;
            Spell?: string;
            extraTag?: string;
            Level: number;
            Power: number;
            Weight: number;
            strict?: true;
            teleportTime?: number;
            filterTag?: string;
            filterBackup?: string;
            arousalMode?: boolean;
        }[];
        min_width: number;
        max_width: number;
        min_height: number;
        max_height: number;
        deadend?: number;
        ShopExclusives?: string[];
        ShopExclusivesArousal?: string[];
        enemyTags: string[];
        "defeat_outfit": outfitKey;
        jailType?: string;
        guardType?: string;
        "shrines": {
            Type: string;
            Weight: number;
        }[];
    }
    interface overrideDisplayItem {
        Item: string;
        Group: string;
        Model?: string;
        Color: string[] | string;
        Filters?: Record<string, LayerFilter>;
        factionColor?: number[][];
        factionFilters?: Record<string, {
            color: string;
            override: boolean;
        }>;
        Property?: any;
        override?: boolean;
        useHairColor?: boolean;
        OverridePriority?: number[] | number;
    }
    interface alwaysDressModel {
        faction?: string;
        Model: string;
        Group?: string;
        Properties?: Record<string, LayerPropertiesType>;
        Filters?: Record<string, LayerFilter>;
        factionFilters?: Record<string, {
            color: string;
            override: boolean;
        }>;
        inheritFilters?: boolean;
        override?: boolean;
        useHairColor?: boolean;
    }
    interface KDLoadout {
        name: string;
        tags?: string[];
        singletag: string[];
        singletag2?: string[];
        forbidtags: string[];
        chance: number;
        items?: string[];
        restraintMult?: number;
        multiplier?: number;
    }
    interface enemy extends KDHasTags {
        special?: boolean;
        overrideFactionDefeat?: boolean;
        customDefeat?: string;
        creationScript?: string;
        alwaysKite?: boolean;
        intro?: string;
        nameList?: string;
        teaseMod?: number;
        startingItems?: string[];
        SFX?: {
            death?: string;
        };
        RestraintFilter?: {
            levelBonus?: number;
            bonusRestraints?: number;
            unlimitedRestraints?: boolean;
            forceStock?: boolean;
            invRestraintsOnly?: boolean;
            limitedRestraintsOnly?: boolean;
            powerThresh?: number;
            ignoreInitial?: string[];
            ignoreInitialTag?: string[];
            noRestock?: boolean;
            restockPercent?: number;
            requiredItems?: string[];
        };
        Magic?: {
            castCooldownUnique?: Record<string, number>;
            priority?: Record<string, number>;
        };
        Security?: {
            level_key?: number;
            level_tech?: number;
            level_magic?: number;
        };
        GFX?: {
            AmbushSprite?: string;
            spriteWidth?: number;
            spriteHeight?: number;
            lighting?: boolean;
        };
        Sound?: {
            moveAmount?: number;
            baseAmount?: number;
            castAmount?: number;
            attackAmount?: number;
            alertAmount?: number;
            decay?: number;
            idleSoundName?: string;
            moveSoundName?: string;
            alertSoundName?: string;
        };
        specialScript?: string;
        spawnAISetting?: string;
        wanderAISetting?: string;
        Behavior?: {
            leashCondition?: string;
            holdStillWhenNear?: boolean;
            behaveAsEnemy?: boolean;
            thorough?: number;
            noPlay?: boolean;
            ensureGroupTied?: string[];
            ensurePlayerTag?: string[];
            ensureGroupTiedArousal?: string[];
            ensurePlayerTagArousal?: string[];
        };
        noOverrideFloor?: boolean;
        summonTags?: string[];
        summonTagsMulti?: string[];
        alwaysBound?: boolean;
        arousalMode?: boolean;
        name: string;
        specialdialogue?: string;
        outOfBoxWeightMult?: number;
        tags: Record<string, boolean>;
        spellResist?: number;
        allied?: boolean;
        willBonus?: number;
        lowpriority?: boolean;
        pathcondition?: string;
        evasion?: number;
        block?: number;
        blockAmount?: number;
        maxdodge?: number;
        maxblock?: number;
        preferDodge?: boolean;
        preferBlock?: boolean;
        armor?: number;
        data?: Record<string, string>;
        hidetimerbar?: boolean;
        Attack?: {
            mustBindorFail?: boolean;
            noFailifHasWP?: boolean;
        };
        Awareness?: {
            chaseradius?: number;
            hearingMult?: number;
            hearingRadius?: number;
            vision?: number;
            senseSpeed?: number;
        };
        Reputation?: {
            noRepLoss?: boolean;
        };
        followRange?: number;
        AI?: string;
        regen?: number;
        visionRadius?: number;
        nonDirectional?: boolean;
        noFlip?: boolean;
        maxhp?: number;
        maxmana?: number;
        manaregen?: number;
        shield?: number;
        shieldregen?: number;
        stamina?: number;
        sprintspeed?: number;
        startinghp?: number;
        minLevel?: number;
        maxLevel?: number;
        weight?: number;
        movePoints?: number;
        attackPoints?: number;
        attack?: string;
        attackRange?: number;
        terrainTags?: Record<string, number>;
        weightMult?: number;
        floors?: Record<string, boolean>;
        events?: KinkyDungeonEvent[];
        allFloors?: boolean;
        noblockplayer?: boolean;
        triggersTraps?: boolean;
        keepLevel?: boolean;
        accuracy?: number;
        playerBlindSight?: number;
        attackWidth?: number;
        power?: number;
        dmgType?: string;
        teaseAttacks?: string;
        bound?: string;
        outfit?: string;
        style?: string;
        nonHumanoid?: boolean;
        color?: string;
        CountLimit?: boolean;
        noTargetSilenced?: boolean;
        silenceTime?: number;
        spells?: string[];
        startBuffs?: any[];
        noMiscast?: boolean;
        miscastsfx?: string;
        miscastmsg?: string;
        unlockCommandLevel?: number;
        unlockCommandCD?: number;
        selfCast?: Record<string, boolean>;
        spellCooldownMult?: number;
        spellCooldownMod?: number;
        kite?: number;
        playerFollowRange?: number;
        minSpellRange?: number;
        stopToCast?: boolean;
        spellRdy?: boolean;
        castWhileMoving?: boolean;
        noAttack?: boolean;
        disarm?: number;
        fullBoundBonus?: number;
        dropTable?: any[];
        attackWhileMoving?: boolean;
        noSpellsLowSP?: boolean;
        rep?: Record<string, number>;
        factionrep?: Record<string, number>;
        guardChance?: number;
        clusterWith?: string;
        ignorechance?: number;
        difficulty?: number;
        projectileAttack?: boolean;
        buffallies?: boolean;
        stunTime?: number;
        staminaDamage?: number;
        specialCD?: number;
        specialAttack?: string;
        specialIgnoreStam?: boolean;
        specialRemove?: string;
        specialExtraTags?: string[];
        specialRemoveTags?: string[];
        specialMsg?: boolean;
        specialCondition?: string;
        specialPower?: number;
        specialDamage?: string;
        specialCDonAttack?: boolean;
        specialWidth?: number;
        specialRange?: number;
        shrines?: string[];
        followLeashedOnly?: boolean;
        blindSight?: number;
        specialCharges?: number;
        strictAttackLOS?: boolean;
        specialAttackPoints?: number;
        stealth?: number;
        noReveal?: boolean;
        ambushRadius?: number;
        wanderTillSees?: boolean;
        dontKiteWhenDisabled?: boolean;
        bindOnDisableSpecial?: boolean;
        bindOnDisable?: boolean;
        smartBind?: boolean;
        hitsfx?: string;
        useLock?: string;
        attackLock?: string;
        applyFaction?: string;
        defaultFaction?: string;
        tilesMinRange?: number;
        attackMinRange?: number;
        specialMinRange?: number;
        noKiteWhenHarmless?: boolean;
        noSpellsWhenHarmless?: boolean;
        ignoreStaminaForBinds?: boolean;
        sneakThreshold?: number;
        RemoteControl?: {
            remote?: number;
            remoteAmount?: number;
            punishRemote?: number;
            punishRemoteChance?: number;
        };
        crit?: number;
        bypass?: boolean;
        multiBind?: number;
        noLeashUnlessExhausted?: boolean;
        ethereal?: boolean;
        alwaysEvade?: boolean;
        alwaysBlock?: boolean;
        Resistance?: {
            profile?: string[];
            alwaysHitByMagic?: boolean;
            alwaysBypassedByMagic?: boolean;
            block_phys?: number;
            block_magic?: number;
            toughArmor?: boolean;
            toughArmorAlways?: boolean;
        };
        summonRage?: boolean;
        noAlert?: boolean;
        master?: masterInfo;
        pullTowardSelf?: boolean;
        pullDist?: number;
        summon?: any[];
        sneakthreshold?: number;
        blockVisionWhileStationary?: boolean;
        squeeze?: boolean;
        earthmove?: boolean;
        noChaseUnrestrained?: boolean;
        suicideOnSpell?: boolean;
        suicideOnAdd?: boolean;
        suicideOnEffect?: boolean;
        suicideOnLock?: boolean;
        alwaysHostile?: boolean;
        specialsfx?: string;
        stunOnSpecialCD?: number;
        Dash?: {
            noDashOnSidestep?: boolean;
            noDashOnMiss?: boolean;
            noDashOnBlock?: boolean;
            EventOnDashMiss?: boolean;
            EventOnDashBlock?: boolean;
        };
        Defeat?: {
            furnitureTags?: {
                tags: string[];
                count: number;
            }[];
            specificRestraints?: {
                name: string;
                minlevel: number;
                maxlevel?: number;
                applyVariant?: string;
            }[];
        };
        attackBonus?: number;
        noLeash?: boolean;
        cohesion?: number;
        noSpellLeashing?: boolean;
        projectileTargeting?: boolean;
        ondeath?: any[];
        blindTime?: number;
        tilesMinRangeSpecial?: number;
        convertTiles?: any[];
        pullMsg?: boolean;
        dashThruWalls?: boolean;
        dashThrough?: boolean;
        cohesionRange?: number;
        kiteChance?: number;
        ignoreflag?: string[];
        failAttackflag?: string[];
        failAttackflagChance?: number;
        failAttackflagDuration?: number;
        visionSummoned?: number;
        dependent?: boolean;
        nopickpocket?: boolean;
        attackThruBars?: boolean;
        noCancelAttack?: boolean;
        keys?: boolean;
        rage?: boolean;
        lifespan?: number;
        noDisplace?: boolean;
        spellWhileParole?: boolean;
        playLine?: string;
        blockVision?: boolean;
        hitsfxSpecial?: string;
        misssfx?: string;
        blocksfx?: string;
        cueSfx?: {
            Block?: string;
            Resist?: string;
            Damage?: string;
            Miss?: string;
        };
        effect?: any;
        noSpellDuringAttack?: boolean;
        faction?: string;
        rescueTo?: {
            Unlock?: string;
            Remove?: string;
            Slime?: string;
        };
        noChannel?: boolean;
        focusPlayer?: boolean;
        immobile?: boolean;
        enemyCountSpellLimit?: number;
        Animations?: string[];
    }
    interface shopItem {
        cost: any;
        rarity: any;
        costMod?: any;
        shoptype: string;
        consumable?: string;
        countItem?: number;
        quantity?: number;
        name: any;
    }
    interface weapon extends damageInfo, NamedAndTyped {
        digSpell?: string;
        stamPenType?: string;
        ignoreshield?: boolean;
        shield_crit?: boolean;
        shield_stun?: boolean;
        shield_freeze?: boolean;
        shield_bind?: boolean;
        shield_snare?: boolean;
        shield_slow?: boolean;
        shield_distract?: boolean;
        shield_vuln?: boolean;
        arousalMode?: boolean;
        costMod?: number;
        name: string;
        damage: number;
        chance: number;
        type: string;
        stam50mult?: number;
        evadeable?: boolean;
        nokill?: boolean;
        bind?: number;
        nodisarm?: boolean;
        addBind?: boolean;
        angle?: number;
        crit?: number;
        bindcrit?: number;
        bindType?: string;
        distract?: number;
        bindEff?: number;
        distractEff?: number;
        desireMult?: number;
        light?: boolean;
        heavy?: boolean;
        massive?: boolean;
        boundBonus?: number;
        tease?: boolean;
        rarity: number;
        staminacost?: number;
        time?: number;
        magic?: boolean;
        noDamagePenalty?: boolean;
        cutBonus?: number;
        playSelfBonus?: number;
        playSelfMsg?: string;
        playSelfSound?: string;
        unarmed: boolean;
        shop: boolean;
        noequip?: boolean;
        sfx: string;
        events?: KinkyDungeonEvent[];
        noHands?: boolean;
        silent?: boolean;
        clumsy?: boolean;
        channel?: number;
        channelslow?: boolean;
        novulnerable?: boolean;
        nocrit?: boolean;
        noblock?: boolean;
        tags?: string[];
        special?: KDWeaponSpecial;
        telekinetic?: boolean;
    }
    interface KDWeaponSpecial {
        noSkip?: boolean;
        type: string;
        spell?: string;
        prereq?: string;
        selfCast?: boolean;
        requiresEnergy?: boolean;
        energyCost?: number;
        range?: number;
    }
    interface KinkyDungeonEvent {
        sprite?: string;
        cloneTags?: string[];
        frequencyMax?: number;
        frequencyMin?: number;
        frequencyStep?: number;
        frequencyTag?: string;
        delayedOrder?: number;
        dynamic?: boolean;
        trim?: boolean;
        cost?: number;
        offhand?: boolean;
        offhandonly?: boolean;
        cursetype?: string;
        curse?: boolean;
        targetType?: string;
        attackerType?: string;
        tags?: string[];
        duration?: number;
        always?: boolean;
        bindEff?: number;
        type: string;
        requireFlag?: string;
        trigger: string;
        threshold?: number;
        removeOnUncurse?: boolean;
        restraint?: string;
        sfx?: string;
        vol?: number;
        power?: number;
        keepLock?: boolean;
        distractEff?: number;
        desireMult?: number;
        count?: number;
        player?: boolean;
        bind?: number;
        crit?: number;
        bindcrit?: number;
        distract?: number;
        mult?: number;
        kind?: string;
        original?: string;
        variance?: number;
        damage?: string;
        element?: string;
        buffTypes?: string[];
        damageTrigger?: string;
        dist?: number;
        aoe?: number;
        buffType?: string;
        bullet?: boolean;
        melee?: boolean;
        time?: number;
        bindType?: string;
        addBind?: boolean;
        chance?: number;
        buff?: any;
        lock?: string;
        desc?: string;
        buffSprite?: string;
        msg?: string;
        source?: number;
        condition?: string;
        prereq?: string;
        color?: string;
        filter?: LayerFilter;
        bgcolor?: string;
        edgeOnly?: boolean;
        cooldown?: Record<string, number>;
        requiredTag?: string;
        requireTags?: string[];
        filterTags?: string[];
        StruggleType?: string;
        requireEnergy?: boolean;
        limit?: number;
        energyCost?: number;
        inheritLinked?: boolean;
        spell?: string;
        subMult?: number;
        noLeash?: boolean;
        stun?: number;
        warningchance?: number;
        punishComponent?: string;
        list?: string[];
        humanOnly?: boolean;
        distStealth?: number;
        enemyDialogue?: string;
        escapeMethod?: string;
        enemy?: string;
        prevSlowLevel?: number;
    }
    type masterInfo = {
        type: string;
        range: number;
        loose?: boolean;
        aggressive?: boolean;
        dependent?: boolean;
        maxDist?: number;
        masterTag?: string;
    };
    interface String {
        KDReplaceOrAddDmg(dmg: string, replaceString?: string): string;
    }
    interface KDBuff {
        id: string;
        power?: number;
        type?: string;
        duration?: number;
        infinite?: boolean;
        aura?: string;
        range?: number;
        currentCount?: number;
        maxCount?: number;
        tags?: string[];
        data?: Record<string, any>;
        mushroom?: boolean;
        cancelOnReapply?: boolean;
        player?: boolean;
        enemies?: boolean;
        events?: KinkyDungeonEvent[];
        endFloor?: boolean;
        endSleep?: boolean;
        spell?: any;
        auraSprite?: any;
        noAuraColor?: boolean;
        showHelpless?: boolean;
        replaceSprite?: any;
        replaceSpriteBound?: any;
        replaceSpriteSuff?: any;
        replaceSpriteSuffBound?: any;
        replacePower?: any;
        labelcolor?: string;
        hide?: boolean;
        text?: any;
        desc?: string;
        buffTextReplace?: Record<string, any>;
        buffSprite?: boolean;
        pose?: any;
        buffSpriteSpecific?: string;
        click?: string;
        disableTypes?: string[];
        sfxApply?: string;
        onlyAlly?: boolean;
        noAlly?: boolean;
    }
    interface entity {
        lastmove?: number;
        runSpawnAI?: boolean;
        tx?: number;
        ty?: number;
        target?: number;
        refreshSprite?: boolean;
        FacilityAction?: string;
        strugglePoints?: number;
        partyLeader?: number;
        bindStun?: number;
        leash?: KDLeashData;
        blockedordodged?: number;
        blocks?: number;
        dodges?: number;
        shield?: number;
        visual_hp?: number;
        visual_boundlevel?: number;
        visual_distraction?: number;
        visual_lifetime?: number;
        master?: masterInfo;
        flip?: boolean;
        sprinted?: boolean;
        exertion?: number;
        playLine?: string;
        outfit?: string;
        outfitBound?: string;
        style?: string;
        intro?: string;
        offX?: number;
        offY?: number;
        scaleX?: number;
        scaleY?: number;
        animTime?: number;
        homeCoord?: WorldCoord;
        spawnX?: number;
        spawnY?: number;
        opinion?: number;
        domVariance?: number;
        hideTimer?: boolean;
        Enemy?: enemy;
        created?: boolean;
        sound?: number;
        boundTo?: number;
        weakBinding?: boolean;
        player?: boolean;
        keys?: boolean;
        ondeath?: any[];
        data?: Record<string, string>;
        rep?: Record<string, number>;
        factionrep?: Record<string, number>;
        dialogue?: string;
        dialogueDuration?: number;
        dialogueColor?: string;
        dialoguePriority?: number;
        CustomName?: string;
        CustomSprite?: string;
        CustomNameColor?: string;
        rescue?: boolean;
        personality?: string;
        patrolIndex?: number;
        flags?: Record<string, number>;
        gold?: number;
        noDrop?: boolean;
        droppedItems?: boolean;
        specialdialogue?: string;
        prisondialogue?: string;
        aggro?: number;
        id?: number;
        hp?: number;
        mana?: number;
        AI?: string;
        moved?: boolean;
        playerdmg?: number;
        idle?: boolean;
        summoned?: boolean;
        boundLevel?: number;
        specialBoundLevel?: Record<string, number>;
        distraction?: number;
        desire?: number;
        lifetime?: number;
        temporary?: boolean;
        maxlifetime?: number;
        attackPoints?: number;
        attackBonus?: number;
        movePoints?: number;
        aware?: boolean;
        vp?: number;
        tracking?: boolean;
        revealed?: boolean;
        ambushtrigger?: boolean;
        castCooldown?: number;
        castCooldownSpecial?: number;
        castCooldownUnique?: Record<string, number>;
        specialCharges?: number;
        usingSpecial?: boolean;
        ignore?: boolean;
        specialCD?: number;
        disarmflag?: number;
        channel?: number;
        items?: string[];
        tempitems?: string[];
        x: number;
        y: number;
        targetingX?: number;
        targetingY?: number;
        lastx?: number;
        lasty?: number;
        fx?: number;
        fy?: number;
        action?: string;
        path?: {
            x: number;
            y: number;
        }[];
        gx?: number;
        gy?: number;
        despawnX?: number;
        despawnY?: number;
        goToDespawn?: boolean;
        gxx?: number;
        gyy?: number;
        rage?: number;
        hostile?: number;
        modified?: boolean;
        faction?: string;
        allied?: number;
        ceasefire?: number;
        bind?: number;
        immobile?: number;
        blind?: number;
        disarm?: number;
        slow?: number;
        freeze?: number;
        teleporting?: number;
        teleportingmax?: number;
        stun?: number;
        silence?: number;
        vulnerable?: number;
        buffs?: Record<string, KDBuff>;
        warningTiles?: warningTileEntry[];
        visual_x?: number;
        visual_y?: number;
        Analyze?: boolean;
        playWithPlayer?: number;
        playWithPlayerCD?: number;
        IntentAction?: string;
        IntentLeashPoint?: {
            x: number;
            y: number;
            type: string;
            radius: number;
            entrance?: boolean;
        };
        CurrentAction?: string;
        RemainingJailLeashTourWaypoints?: number;
        NextJailLeashTourWaypointX?: number;
        NextJailLeashTourWaypointY?: number;
        KinkyDungeonJailTourInfractions?: number;
        CurrentRestraintSwapGroup?: string;
    }
    type KinkyDungeonDress = {
        Item: string;
        Group?: string;
        Color: string | string[];
        Filters?: Record<string, LayerFilter>;
        Properties?: Record<string, LayerPropertiesType>;
        factionFilters?: Record<string, FactionFilterDef>;
        Lost: boolean;
        NoLose?: boolean;
        Property?: any;
        OverridePriority?: number;
        Skirt?: boolean;
    }[];
    interface KinkyDialogueTrigger {
        dialogue: string;
        allowedPrisonStates?: string[];
        allowedPersonalities?: string[];
        blockDuringPlaytime?: boolean;
        talk?: boolean;
        noAlly?: boolean;
        excludeTags?: string[];
        requireTags?: string[];
        requireTagsSingle?: string[];
        requireTagsSingle2?: string[];
        playRequired?: boolean;
        onlyDuringPlay?: boolean;
        allowPlayExceptionSub?: boolean;
        noCombat?: boolean;
        nonHostile?: boolean;
        prerequisite: (enemy: entity, dist: number, AIData: any) => boolean;
        weight: (enemy: entity, dist: number) => number;
    }
    interface effectTile {
        x?: number;
        y?: number;
        infinite?: boolean;
        lightColor?: number;
        yoffset?: number;
        xoffset?: number;
        name: string;
        functionName?: string;
        duration: number;
        priority: number;
        data?: any;
        affinities?: string[];
        affinitiesStanding?: string[];
        drawOver?: boolean;
        tags: string[];
        pauseDuration?: number;
        pauseSprite?: string;
        brightness?: number;
        noWalls?: boolean;
        visionBlockRadius?: number;
        skin?: string;
        fade?: string;
        yfade?: string;
        yfadeamount?: number;
        statuses?: Record<string, number>;
        spin?: number;
        spinAngle?: number;
    }
    interface effectTileRef {
        name: string;
        infinite?: boolean;
        duration?: number;
        data?: any;
        pauseDuration?: number;
        pauseSprite?: string;
        skin?: string;
        statuses?: Record<string, number>;
    }
    type KDPerk = {
        debuff?: boolean;
        buff?: boolean;
        category: string;
        id: string | number;
        cost: number;
        block?: string[];
        tags?: string[];
        blocktags?: string[];
        blockclass?: string[];
        locked?: boolean;
        outfit?: string;
        require?: string;
        costGroup?: string;
        startPriority?: number;
        requireArousal?: boolean;
    };
    interface SubCastInfo {
        target?: string;
        tx?: number;
        ty?: number;
        mx?: number;
        my?: number;
        targetID?: number;
        noTargetMoveDir?: boolean;
        directional?: boolean;
        randomDirection?: boolean;
        randomDirectionPartial?: boolean;
        randomDirectionFallback?: boolean;
        alwaysRandomBuff?: string;
        aimAtTarget?: boolean;
        spell: string;
        chance?: number;
        countPerCast?: number;
        offset?: boolean;
        spread?: number;
        sfx?: string;
        strict?: boolean;
    }
    interface BulletTickData {
        bullet: KDBullet;
        delta: number;
        allied: boolean;
        cancelCast: boolean;
        cancelMove: boolean;
    }
    interface spell {
        nocrit?: boolean;
        bindTags?: string[];
        ignoreshield?: boolean;
        shield_crit?: boolean;
        shield_stun?: boolean;
        shield_freeze?: boolean;
        shield_bind?: boolean;
        shield_snare?: boolean;
        shield_slow?: boolean;
        shield_distract?: boolean;
        shield_vuln?: boolean;
        crit?: number;
        miscastSfx?: string;
        noDirectDamage?: true;
        noDirectHit?: true;
        hideWarnings?: boolean;
        alwaysWarn?: boolean;
        commandword?: boolean;
        buffallies?: boolean;
        noSelfBuff?: boolean;
        selfbuff?: boolean;
        bindType?: string;
        slowStart?: boolean;
        bulletSpin?: number;
        hitSpin?: number;
        fastStart?: boolean;
        aoetype?: string;
        aoetypetrail?: string;
        secondaryhit?: string;
        upcastFrom?: string;
        upcastLevel?: number;
        hitColor?: number;
        bulletColor?: number;
        trailColor?: number;
        hitLight?: number;
        bulletLight?: number;
        trailLight?: number;
        goToPage?: number;
        tags?: string[];
        effectTile?: effectTileRef;
        effectTileAoE?: number;
        effectTileDurationMod?: number;
        effectTilePre?: effectTileRef;
        effectTileDurationModPre?: number;
        effectTileLinger?: effectTileRef;
        effectTileDurationModLinger?: number;
        effectTileDensityLinger?: number;
        effectTileTrail?: effectTileRef;
        effectTileDurationModTrail?: number;
        effectTileDensityTrail?: number;
        effectTileTrailAoE?: number;
        effectTileDoT?: effectTileRef;
        effectTileDoT2?: effectTileRef;
        effectTileDistDoT?: number;
        effectTileDurationModDoT?: number;
        effectTileDensityDoT?: number;
        effectTileDensityFullIfEmpty?: boolean;
        effectTileDensity?: number;
        hide?: boolean;
        shotgunCount?: number;
        shotgunFan?: boolean;
        shotgunSpread?: number;
        shotgunDistance?: number;
        shotgunSpeedBonus?: number;
        distractEff?: number;
        desireMult?: number;
        bindEff?: number;
        nonmagical?: boolean;
        damageFlags?: string[];
        noTrailOnPlayer?: boolean;
        noTrailOnEntity?: boolean;
        noTrailOnAlly?: boolean;
        color?: string;
        buffAll?: boolean;
        name: string;
        customCost?: string;
        quick?: boolean;
        addBind?: boolean;
        prerequisite?: string | string[];
        blockedBy?: string[];
        hideUnlearnable?: boolean;
        hideWithout?: string;
        hideWith?: string;
        hideLearned?: boolean;
        autoLearn?: string[];
        learnPage?: string[];
        noAggro?: boolean;
        itemEffect?: string;
        allySpell?: boolean;
        noFF?: boolean;
        friendlyfire?: boolean;
        noHitAlliedPlayer?: boolean;
        faction?: string;
        enemySpell?: boolean;
        noDirectionOffset?: boolean;
        arousalMode?: boolean;
        school?: string;
        special?: string;
        power?: number;
        aoedamage?: number;
        damage?: string;
        tease?: boolean;
        size?: number;
        noUniqueHits?: boolean;
        aoe?: number;
        bulletAoE?: number;
        bind?: number;
        bindcrit?: number;
        distract?: number;
        boundBonus?: number;
        outfit?: string;
        speed?: number;
        knifecost?: number;
        staminacost?: number;
        manacost: number;
        chargecost?: number;
        minRange?: number;
        noSprite?: boolean;
        learnFlags?: string[];
        increasingCost?: boolean;
        decreaseCost?: boolean;
        classSpecific?: string;
        components?: string[];
        followCaster?: boolean;
        level: number;
        passive?: boolean;
        mixedPassive?: boolean;
        active?: boolean;
        costOnToggle?: boolean;
        type: string;
        noconsume?: boolean;
        quantity?: number;
        onhit?: string;
        time?: number;
        delay?: number;
        delayRandom?: number;
        castRange?: number;
        range?: number;
        lifetime?: number;
        noSource?: boolean;
        bulletLifetime?: number;
        channel?: number;
        noise?: number;
        block?: number;
        sfx?: string;
        hitsfx?: string;
        landsfx?: string;
        trailEvadeable?: boolean;
        trailNoBlock?: boolean;
        trailPower?: number;
        trailHit?: string;
        trailLifetime?: number;
        trailTime?: number;
        lingeringDelayed?: boolean;
        lifetimeHitBonus?: number;
        trailLifetimeBonus?: number;
        trailPlayerEffect?: any;
        trailChance?: number;
        trailOnSelf?: boolean;
        trailDamage?: string;
        trailspawnaoe?: number;
        trailcast?: any;
        trail?: string;
        spellPointCost?: number;
        heal?: boolean;
        buff?: boolean;
        castCondition?: string;
        mustTarget?: boolean;
        noTargetPlayer?: boolean;
        WallsOnly?: boolean;
        evadeable?: boolean;
        noblock?: boolean;
        meleeOrigin?: boolean;
        noDoubleHit?: boolean;
        noCastOnHit?: boolean;
        castDuringDelay?: boolean;
        instantCast?: boolean;
        spellcast?: SubCastInfo;
        extraCast?: SubCastInfo[];
        spellcasthit?: SubCastInfo;
        buffs?: KDBuff[];
        defaultOff?: boolean;
        events?: KinkyDungeonEvent[];
        hitevents?: KinkyDungeonEvent[];
        piercing?: boolean;
        pierceEnemies?: boolean;
        passthrough?: boolean;
        dot?: boolean;
        noTerrainHit?: boolean;
        noEnemyCollision?: boolean;
        alwaysCollideTags?: string[];
        piercingTrail?: boolean;
        nonVolatile?: boolean;
        nonVolatileTrail?: boolean;
        volatile?: boolean;
        volatilehit?: boolean;
        blockType?: string[];
        cancelAutoMove?: boolean;
        requireLOS?: boolean;
        selfTargetOnly?: boolean;
        filterTags?: string[];
        msg?: boolean;
        noSumMsg?: boolean;
        projectileTargeting?: boolean;
        extraDist?: number;
        CastInWalls?: boolean;
        CastInDark?: boolean;
        noTargetEnemies?: boolean;
        exceptionFactions?: string[];
        noTargetAllies?: boolean;
        targetPlayerOnly?: boolean;
        specialCD?: number;
        noFirstChoice?: boolean;
        playerEffect?: any;
        noCastMsg?: boolean;
        selfcast?: boolean;
        noMiscast?: boolean;
        summon?: any[];
        secret?: boolean;
        defaultFaction?: boolean;
        trailBind?: number;
    }
    interface KDQuest {
        name: string;
        oncancel?: (player: entity, force: boolean, intentional: boolean, success: boolean) => boolean;
        priority?: (player: entity) => number;
        text?: (player: entity) => string[];
        npc: string;
        visible: boolean;
        nocancel?: boolean;
        tick?: (delta: number) => void;
        worldgenstart?: () => void;
        accept?: () => void;
        weight: (RoomType: any, MapMod: any, data: any, currentQuestList?: any) => number;
        prerequisite: (RoomType: any, MapMod: any, data: any, currentQuestList: any) => boolean;
        tags?: string[];
    }
    interface KDPoint {
        x: number;
        y: number;
    }
    interface KDJailPoint extends KDPoint {
        type: string;
        entrance?: boolean;
        radius: number;
        requireLeash?: boolean;
        requireFurniture?: boolean;
        direction?: {
            x: number;
            y: number;
        };
        restraint?: string;
        restrainttags?: string[];
    }
    interface KinkyDialogue {
        image?: string;
        data?: Record<string, string>;
        tags?: string[];
        singletag?: string[];
        excludeTags?: string[];
        inventory?: boolean;
        clickFunction?: (gagged: boolean, player: entity) => boolean | undefined;
        enterFunction?: (gagged: boolean, player: entity, fromstage: string) => void;
        drawFunction?: (gagged: boolean, player: entity, delta: number) => boolean;
        gagFunction?: (player: entity) => boolean | undefined;
        prerequisiteFunction?: (gagged: boolean, player: entity) => boolean;
        greyoutFunction?: (gagged: boolean, player: entity) => boolean;
        greyoutCustomTooltip?: (gagged: boolean, player: entity) => string;
        greyoutTooltip?: string;
        personalities?: string[];
        leadsTo?: string;
        leadsToStage?: string;
        skip?: boolean;
        dontTouchText?: boolean;
        exitDialogue?: boolean;
        response?: string;
        responseGag?: boolean;
        playertext?: string;
        gag?: boolean;
        gagThreshold?: number;
        gagDisabled?: boolean;
        gagRequired?: boolean;
        options?: Record<string, KinkyDialogue>;
        extraOptions?: string;
        outfit?: string;
        chance?: number;
    }
    interface KinkyVibration {
        sound: string;
        source: string;
        name: string;
        intensity: number;
        location: string[];
        duration: number;
        durationLeft: number;
        denyTime?: number;
        denyTimeLeft?: number;
        denialsLeft?: number;
        alwaysDeny?: boolean;
        denialChance?: number;
        denialChanceLikely?: number;
        edgeTime?: number;
        edgeTimeLeft?: number;
        tickEdgeAtMaxArousal?: boolean;
        loopsLeft?: number;
        edgeOnly?: boolean;
        VibeModifiers: VibeMod[];
    }
    interface VibeMod {
        sound: string;
        source: string;
        name: string;
        location: string;
        duration: number;
        durationLeft: number;
        intensityMod: number;
        intensitySetpoint?: number;
        edgeOnly?: boolean;
        forceDeny?: boolean;
        bypassDeny?: boolean;
        bypassEdge?: boolean;
        extendDuration?: boolean;
        denyChanceMod?: number;
        denyChanceLikelyMod?: number;
    }
    interface KDStruggleData {
        angelHelp: boolean;
        minSpeed: number;
        handBondage: number;
        armsBound: boolean;
        handsBound: boolean;
        failSuffix: string;
        restraint: item;
        struggleType: string;
        struggleGroup: string;
        escapeChance: number;
        cutBonus: number;
        origEscapeChance: number;
        lowEscapeChance: number;
        origLimitChance: number;
        helpChance: number;
        limitChance: number;
        strict: number;
        cutSpeed: number;
        affinity: string;
        hasAffinity: boolean;
        restraintEscapeChance: number;
        cost: number;
        noise: number;
        wcost: number;
        escapePenalty: number;
        willEscapePenalty: number;
        canCut: boolean;
        canCutMagic: boolean;
        toolBonus: number;
        cutMultBonus: number;
        cutMult: number;
        toolMult: number;
        buffBonus: number;
        buffMult: number;
        restriction: number;
        struggleTime: number;
        speedMult: number;
        escapeSpeed: number;
        query: boolean;
        maxLimit: number;
        result: string;
        lockType: KDLockType;
        extraLim: number;
        extraLimPenalty: number;
        extraLimThreshold: number;
        upfrontWill?: boolean;
    }
    interface KDFilteredInventoryItem {
        name: any;
        item: item;
        preview: string;
        preview2?: string;
        previewcolor?: string;
        previewcolorbg?: string;
        key?: string;
    }
    interface KDInventoryActionDef {
        text?: (player: entity, item: item) => string;
        label?: (player: entity, item: item) => string;
        itemlabel?: (player: entity, item: item) => string;
        labelcolor?: (player: entity, item: item) => string;
        itemlabelcolor?: (player: entity, item: item) => string;
        show?: (player: entity, item: item) => boolean;
        valid: (player: entity, item: item) => boolean;
        click: (player: entity, item: item) => void;
        cancel: (player: entity, delta: number) => boolean;
        icon: (player: entity, item: item) => string;
        hotkey?: () => string;
        hotkeyPress?: () => string;
        alsoShow?: string[];
    }
    interface KinkyDungeonSave {
        stats: any;
        KinkyDungeonEffectTiles: any;
        KinkyDungeonTiles: any;
        KinkyDungeonTilesSkin: any;
        KinkyDungeonTilesMemory: any;
        KinkyDungeonRandomPathablePoints: any;
        KinkyDungeonEntities: any;
        KinkyDungeonBullets: any;
        KinkyDungeonStartPosition: any;
        KinkyDungeonEndPosition: any;
        KinkyDungeonGrid: any;
        KinkyDungeonGridWidth: number;
        KinkyDungeonGridHeight: number;
        KinkyDungeonFogGrid: any;
        saveStat: {
            version: string;
            appearance: any[];
            default: KinkyDungeonDress;
            poses: Record<string, boolean>;
            Palette: string;
            metadata: KDOutfitMetadata;
            outfit: string;
            name: string;
            level: number;
            sp: string;
            mp: string;
            wp: string;
            dp: string;
        };
        KinkyDungeonCurrentTick: number;
        errorloading: boolean;
        modsmissing: boolean;
        version: string;
        KinkyDungeonPlayerEntity: any;
        level: number;
        checkpoint: string;
        rep: Record<string, number>;
        costs: Record<string, number>;
        pcosts: Record<string, number>;
        orbs: number[];
        chests: number[];
        dress: string;
        gold: number;
        points: number;
        progression: string;
        inventoryVariants: Record<string, KDRestraintVariant>;
        consumableVariants: Record<string, KDConsumableVariant>;
        weaponVariants: Record<string, KDWeaponVariant>;
        grounditems: any;
        perks: string[];
        levels: {
            Elements: number;
            Conjure: number;
            Illusion: number;
        };
        rescued: Record<string, boolean>;
        aid: Record<string, boolean>;
        seed: string;
        statchoice: [string, boolean][];
        mapIndex: Record<string, string>;
        id: number;
        idspell: number;
        choices: number[];
        choices_wep: string[];
        choices_arm: string[];
        choices_con: string[];
        choices2: boolean[];
        buffs: Record<string, any>;
        lostitems: any[];
        caches: number[];
        hearts: number[];
        spells: string[];
        inventory: item[];
        KDGameData: KDGameDataBase;
        KDMapData: KDMapDataType;
        KDWorldMap: Record<string, KDWorldSlot>;
        KDEventData: Object;
        KDCurrentWorldSlot: {
            x: number;
            y: number;
        };
        KDPersistentNPCs: string;
        KDDeletedIDs: string;
        KDPersonalAlt: string;
        flags: [string, number][];
        uniqueHits: [string, boolean][];
        KDCommanderRoles: [number, string][];
        picks: number;
        rkeys: number;
        bkeys: number;
        mana: number;
        manapool: number;
        stamina: number;
        willpower: number;
        distraction: number;
        distractionlower: number;
        wep: any;
        npp: number;
        diff: number;
        inventoryarray?: {
            consumable: item[];
            restraint: item[];
            looserestraint: item[];
            weapon: item[];
            outfit: item[];
        };
        potions?: {
            stamina: number;
            mana: number;
            will: number;
            dist: number;
        };
        journey?: string;
        mistresskey?: number;
        outfitForPreview?: string[];
        arousalMode?: boolean;
        itemMode?: number;
        plug?: boolean;
        plugFront?: boolean;
        piercing?: boolean;
        random?: boolean;
        savemode?: boolean;
        hardmode?: boolean;
        extrememode?: boolean;
        perksmode?: number;
        easymode?: number;
        progressionmode?: string;
        faction: Record<string, Record<string, number>>;
    }
    interface KDWorldSlot {
        data: Record<string, KDMapDataType>;
        x: number;
        y: number;
        jx: number;
        jy: number;
        color: string;
        name: string;
        main: string;
        outposts: Record<string, string>;
        lairs: Record<string, string>;
        lairsToPlace: Record<string, string[]>;
    }
    interface KDLabel {
        name: string;
        type: string;
        faction?: string;
        x: number;
        y: number;
        guard?: boolean;
        interesting?: boolean;
        assigned: number;
    }
    interface RepopQueueData {
        x: number;
        y: number;
        time: number;
        entity: entity;
        loose?: boolean;
    }
    interface KDBullet {
        type?: string;
        born: number;
        time?: number;
        lifetime?: number;
        reflected?: boolean;
        y: number;
        x: number;
        vx: number;
        vy: number;
        xx?: number;
        yy?: number;
        ox?: number;
        oy?: number;
        visual_x?: number;
        visual_y?: number;
        spriteID?: string;
        bullet: KDBulletData;
        trail?: string;
        trailEffectTile?: effectTileRef;
        shadowBuff?: boolean;
        source?: number;
        delay?: number;
        warnings?: string[];
        alreadyHit?: string[];
        secondary?: boolean;
        collisionUpdate?: boolean;
        faction?: string;
    }
    interface KDBulletData {
        inheritedflags?: any;
        flags?: any;
        name: string;
        width: number;
        height: number;
        bulletColor?: number;
        bulletLight?: number;
        faction: string;
        spell?: spell;
        damage?: damageInfo;
        lifetime: number;
        passthrough?: boolean;
        noSprite?: boolean;
        hit?: string;
        trail?: boolean;
        source?: number;
        dmgMult?: number;
        dmgBoost?: number;
        bulletSpin?: number;
        hitevents?: KinkyDungeonEvent[];
        effectTile?: effectTileRef;
        effectTileDurationMod?: number;
        playerEffect?: any;
        summon?: Record<string, any>;
        blockType?: string[];
        followPlayer?: boolean;
        followCaster?: number;
        cancelCaster?: number;
        dot?: boolean;
        cast?: SubCastInfo;
        events?: KinkyDungeonEvent[];
        block?: number;
        volatile?: boolean;
        volatilehit?: boolean;
        targetX?: number;
        targetY?: number;
        effectTileTrail?: effectTileRef;
        effectTileDurationModTrail?: number;
        effectTileTrailAoE?: number;
        noEnemyCollision?: boolean;
        alwaysCollideTags?: string[];
        nonVolatile?: boolean;
        noDoubleHit?: boolean;
        pierceEnemies?: boolean;
        piercing?: boolean;
        origin?: Record<string, number>;
        range?: number;
        NoMsg?: boolean;
        aoe?: number;
        noise?: number;
        blockhit?: number;
        blockTypehit?: string[];
        effectTileLinger?: effectTileRef;
        effectTileDurationModLinger?: number;
        aoetype?: string;
    }
    interface shrineListing {
        type: string;
        quest: string;
        x: number;
        y: number;
    }
    interface KDMapDataType {
        RespawnQueue: {
            faction: string;
            enemy: string;
        }[];
        SpecialAreas: {
            x: number;
            y: number;
            radius: number;
        }[];
        mapX: number;
        mapY: number;
        RepopulateQueue: RepopQueueData[];
        Checkpoint: string;
        Title: string;
        PrisonState: string;
        ExpStair: Record<string, number>;
        PrisonStateStack: string[];
        PrisonType: string;
        ShrineList: shrineListing[];
        LairsToPlace: string[];
        PotentialEntrances: LairEntrance[];
        UsedEntrances: Record<string, LairEntrance>;
        Labels: Record<string, KDLabel[]>;
        flags?: string[];
        data: Record<string, any>;
        Regiments: Record<string, number>;
        GroundItems: {
            x: number;
            y: number;
            name: string;
            amount?: number;
        }[];
        Grid: string;
        Traffic: number[][];
        GridWidth: number;
        GridHeight: number;
        FogGrid: any[];
        FogMemory: any[];
        Tiles: Record<string, any>;
        TilesSkin: Record<string, any>;
        TilesMemory: Record<string, any>;
        EffectTiles: Record<string, Record<string, effectTile>>;
        RandomPathablePoints: Record<string, {
            x: number;
            y: number;
            tags?: string[];
        }>;
        Entities: entity[];
        Bullets: KDBullet[];
        StartPosition: {
            x: number;
            y: number;
        };
        EndPosition: {
            x: number;
            y: number;
        };
        ShortcutPositions: Record<string, {
            x: number;
            y: number;
        }>;
        PatrolPoints: {
            x: number;
            y: number;
        }[];
        MapBrightness: number;
        ConstantX: boolean;
        RoomType: string;
        MapMod: string;
        EscapeMethod: string;
        KillTarget: string;
        KillQuota: number;
        TrapQuota: number;
        TrapsTriggered: number;
        ChestQuota: number;
        ChestsOpened: number;
        QuestQuota: number;
        QuestsAccepted: number;
        KeyQuota: number;
        KeysHeld: number;
        JailPoints: KDJailPoint[];
        ShopItems: shopItem[];
        PoolUses: number;
        PoolUsesGrace: number;
        CategoryIndex: Record<string, {
            category: string;
            tags: string[];
        }>;
        JailFaction: string[];
        GuardFaction: string[];
        MapFaction: string;
        clickHeadpatted: boolean;
    }
    type KDSideRoom = {
        name: string;
        faction?: string;
        weight: number;
        tags?: string[];
        hidden?: boolean;
        chance: number;
        filter: (slot: KDJourneySlot, side: boolean) => number;
        mapMod: string;
        altRoom: string;
        escapeMethod?: string;
        stairCreation: (tile: any, x: number, y: number) => boolean;
        wandertags: Record<string, number>;
        worldGenScript?: (coord: WorldCoord) => void;
        beforeWorldGenScript?: (coord: WorldCoord) => void;
    };
    type MapMod = {
        name: string;
        roomType: string;
        jailType?: string;
        guardType?: string;
        weight: number;
        filter: (slot: KDJourneySlot) => number;
        tags: string[];
        faction?: string;
        tagsOverride?: string[];
        bonusTags: Record<string, {
            bonus: number;
            mult: number;
        }>;
        spawnBoxes?: any[];
        bonussetpieces?: {
            Type: string;
            Weight: number;
        }[];
        altRoom: string;
        worldGenScript?: (coord: WorldCoord) => void;
        beforeWorldGenScript?: (coord: WorldCoord) => void;
        escapeMethod?: string;
        noPersistentPrisoners?: boolean;
        noPersistentSpawn?: boolean;
    };
    type AIType = {
        noOverride?: boolean;
        override?: Record<string, string>;
        strictwander?: boolean;
        guard?: boolean;
        ambush?: boolean;
        ambushtile?: string;
        init: (enemy: entity, player: entity, aidata: KDAIData) => void;
        beforemove: (enemy: entity, player: entity, aidata: KDAIData) => boolean;
        chase: (enemy: entity, player: entity, aidata: KDAIData) => boolean;
        trackvisibletarget: (enemy: entity, player: entity, aidata: KDAIData) => boolean;
        persist: (enemy: entity, player: entity, aidata: KDAIData) => boolean;
        move: (enemy: entity, player: entity, aidata: KDAIData) => boolean;
        follower: (enemy: entity, player: entity, aidata: KDAIData) => boolean;
        followsound: (enemy: entity, player: entity, aidata: KDAIData) => boolean;
        wander_near: (enemy: entity, player: entity, aidata: KDAIData) => boolean;
        wander_far: (enemy: entity, player: entity, aidata: KDAIData) => boolean;
        wandernear_func?: (enemy: entity, player: entity, aidata: KDAIData) => boolean;
        wanderfar_func?: (enemy: entity, player: entity, aidata: KDAIData) => boolean;
        resetguardposition: (enemy: entity, player: entity, aidata: KDAIData) => boolean;
        attack: (enemy: entity, player: entity, aidata: KDAIData) => boolean;
        spell: (enemy: entity, player: entity, aidata: KDAIData) => boolean;
        aftermove: (enemy: entity, player: entity, aidata: KDAIData) => boolean;
        afteridle?: (enemy: entity, player: entity, aidata: KDAIData) => boolean;
        wanderDelay_long?: (enemy: entity, aidata?: KDAIData) => number;
        wanderDelay_short?: (enemy: entity, aidata?: KDAIData) => number;
    };
    interface KDRuneCountData {
        maxRunes: number;
        runes: number;
        explodeChance: number;
        runeList: any[];
    }
    interface KDAITriggerData {
        playAllowed?: boolean;
        aggressive?: boolean;
        playerDist?: number;
        allowPlayExceptionSub?: boolean;
        ignoreNoAlly?: boolean;
        ignoreCombat?: boolean;
        canTalk?: boolean;
    }
    interface KDAIData extends KDAITriggerData {
        playerItems?: item[];
        player?: entity;
        canTalk?: boolean;
        defeat?: boolean;
        idle?: boolean;
        moved?: boolean;
        refreshWarningTiles?: boolean;
        ignore?: boolean;
        harmless?: boolean;
        hostile?: boolean;
        allied?: boolean;
        domMe?: boolean;
        hitsfx?: string;
        highdistraction?: boolean;
        distracted?: boolean;
        bindLevel?: number;
        ignoreLocks?: boolean;
        MovableTiles?: string;
        AvoidTiles?: string;
        attack?: string;
        range?: number;
        width?: number;
        accuracy?: number;
        damage?: string;
        power?: number;
        vibe?: boolean;
        leashing?: boolean;
        addLeash?: boolean;
        targetRestraintLevel?: number;
        addMoreRestraints?: boolean;
        canAggro?: boolean;
        wantsToAttack?: boolean;
        wantsToTease?: boolean;
        canTease?: boolean;
        canAttack?: boolean;
        wantsToCast?: boolean;
        wantsToLeash?: boolean;
        focusOnLeash?: boolean;
        moveTowardPlayer?: boolean;
        SlowLeash?: boolean;
        intentToLeash?: boolean;
        leashed?: boolean;
        holdStillWhenNear?: boolean;
        leashPos?: {
            x: number;
            y: number;
        };
        nearestJail?: KDJailPoint;
        master?: entity;
        kiteChance?: number;
        kite?: boolean;
        ignoreRanged?: boolean;
        patrolChange?: boolean;
        allyFollowPlayer?: boolean;
        dontFollow?: boolean;
        visionMod?: number;
        followRange?: number;
        visionRadius?: number;
        chaseRadius?: number;
        blindSight?: number;
        sneakMult?: number;
        directionOffset?: number;
        playerDistDirectional?: number;
        canSensePlayer?: boolean;
        canSeePlayer?: boolean;
        canSeePlayerChase?: boolean;
        canSeePlayerMedium?: boolean;
        canSeePlayerClose?: boolean;
        canSeePlayerVeryClose?: boolean;
        canShootPlayer?: boolean;
        playChance?: number;
        startedDialogue?: boolean;
        playEvent?: boolean;
    }
    interface KDJailRestraint {
        Name: string;
        Level: number;
        Variant?: string;
        Condition?: string;
        Priority?: string;
        Lock?: string;
    }
    type EnemyEvent = {
        overrideIgnore?: boolean;
        forceattack?: boolean;
        aggressive?: boolean;
        nonaggressive?: boolean;
        play?: boolean;
        noplay?: boolean;
        noMassReset?: boolean;
        decideAttack?: (enemy: entity, target: entity, AIData: any, allied: boolean, hostile: boolean, aggressive: boolean) => boolean;
        decideSpell?: (enemy: entity, target: entity, AIData: any, allied: boolean, hostile: boolean, aggressive: boolean) => boolean;
        weight: (enemy: entity, AIData: any, allied: boolean, hostile: boolean, aggressive: boolean) => number;
        trigger: (enemy: entity, AIData: any) => void;
        arrive?: (enemy: entity, AIData: any) => boolean;
        maintain?: (enemy: entity, delta: number, AIData?: KDAIData) => boolean;
        beforeMove?: (enemy: entity, AIData: any, delta: number) => boolean;
        beforeAttack?: (enemy: entity, AIData: any, delta: number) => boolean;
        beforeSpell?: (enemy: entity, AIData: any, delta: number) => boolean;
    };
    type KDLockType = {
        specialActions?: (tile: any, entity: entity) => void;
        canNPCPass: (xx: number, yy: number, MapTile: object, Enemy: entity) => boolean;
        filter: (Guaranteed: boolean, Floor: number, AllowGold: boolean, Type: string, data: any) => boolean;
        weight: (Guaranteed: boolean, Floor: number, AllowGold: boolean, Type: string, data: any) => number;
        consume_key: boolean;
        lockmult: number;
        penalty?: Record<string, number>;
        pickable: boolean;
        hackPick?: boolean;
        pick_speed: number;
        pick_diff: number;
        pick_lim?: number;
        canPick: (data: any) => boolean;
        doPick: (data: any) => boolean;
        failPick: (data: any) => string;
        breakChance: (data: any) => boolean;
        unlockable: boolean;
        unlock_diff?: number;
        key: string;
        canUnlock: (data: any) => boolean;
        doUnlock: (data: any) => boolean;
        doLock?: (data: any) => void;
        failUnlock: (data: any) => string;
        removeKeys: (data: any) => void;
        levelStart: (item: any) => void;
        shrineImmune: boolean;
        commandlevel: number;
        commandable: boolean;
        command_lesser: () => number;
        command_greater: () => number;
        command_supreme: () => number;
        loot_special: boolean;
        loot_locked: boolean;
    };
    type KDBondageStatus = {
        silence: number;
        bind: number;
        slow: number;
        blind: number;
        disarm: number;
        reduceaccuracy: number;
        toy: number;
        plug: number;
        belt: number;
        immobile: number;
    };
    type KDMapTile = {
        Labels?: Record<string, KDLabel[]>;
        name: string;
        w: number;
        h: number;
        primInd: string;
        index: Record<string, string>;
        flexEdge?: Record<string, string>;
        flexEdgeSuper?: Record<string, string>;
        scale: number;
        category: string;
        weight: number;
        grid: string;
        POI: any[];
        Keyring?: any[];
        Jail: any[];
        Tiles: Record<string, any>;
        effectTiles: Record<string, Record<string, effectTile>>;
        Skin: Record<string, any>;
        inaccessible: {
            indX1: number;
            indY1: number;
            dir1: string;
            indX2: number;
            indY2: number;
            dir2: string;
        }[];
        tags: string[];
        forbidTags?: string[];
        requireTags?: string[];
        indexTags: string[];
        maxTags: number[];
        bonusTags: number[];
        multTags: number[];
        notTags?: any[];
    };
    interface KDBondage {
        helpImmune?: boolean;
        color: string;
        enemyBondageMult: number;
        priority: number;
        struggleRate: number;
        healthStruggleBoost: number;
        powerStruggleBoost: number;
        mageStruggleBoost?: number;
        latex?: boolean;
    }
    interface KDCursedVar {
        variant: (restraint: restraint, newRestraintName: string) => any;
        level: number;
    }
    interface KDDelayedAction {
        data: any;
        time: number;
        tick: number;
        maxtime: number;
        commit: string;
        update?: string;
        tags: string[];
    }
    interface KDBondageMachineFunc {
        eligible_player: (tile: any, x: number, y: number, entity: entity) => boolean;
        eligible_enemy: (tile: any, x: number, y: number, entity: entity) => boolean;
        function_player: (tile: any, delta: number, x: number, y: number, entity: entity) => boolean;
        function_enemy: (tile: any, delta: number, x: number, y: number, entity: entity) => boolean;
    }
    interface KDDroppedItemProp {
        tinyness?: number;
        persistent?: boolean;
    }
    type KDParticleData = {
        camX?: number;
        camY?: number;
        zIndex: number;
        fadeEase?: string;
        time: number;
        phase?: number;
        scale?: number;
        scale_delta?: number;
        rotation?: number;
        rotation_spread?: number;
        vy?: number;
        vy_spread?: number;
        vx?: number;
        vx_spread?: number;
        sin_period?: number;
        sin_period_spread?: number;
        sin_x?: number;
        sin_x_spread?: number;
        sin_y?: number;
        sin_y_spread?: number;
        lifetime: number;
        lifetime_spread?: number;
    };
    type KDParticleEmitterData = {
        rate: number;
        cd: number;
        camX?: number;
        camY?: number;
        zIndex: number;
        fadeEase?: string;
        time: number;
        phase?: number;
        scale?: number;
        scale_delta?: number;
        rotation?: number;
        rotation_spread?: number;
        noFace?: boolean;
        vy?: number;
        vy_spread?: number;
        vx?: number;
        vx_spread?: number;
        sin_period?: number;
        sin_period_spread?: number;
        sin_x?: number;
        sin_x_spread?: number;
        sin_y?: number;
        sin_y_spread?: number;
        lifetime: number;
        lifetime_spread?: number;
    };
    interface KDCursedDef {
        alwaysRemoveOnUnlock?: boolean;
        noShrine?: boolean;
        lock?: boolean;
        powerMult?: number;
        powerBoost?: number;
        activatecurse?: boolean;
        customIcon_RemoveFailure?: string;
        customIcon_RemoveSuccess?: string;
        customIcon_hud?: string;
        shrineRemove?: string[];
        level: number;
        weight: (item: any, allHex?: any) => number;
        customStruggle?: (item: item, Curse?: string) => void;
        customInfo?: (item: item, Curse?: string) => void;
        onApply?: (item: item, host?: item) => void;
        condition: (item: item) => boolean;
        remove: (item: item, host: item, specialMethod: boolean) => boolean | void;
        events?: KinkyDungeonEvent[];
    }
    type KDRestraintVariant = {
        prefix?: string;
        suffix?: string;
        curse?: string;
        lock?: string;
        events: KinkyDungeonEvent[];
        template: string;
        noKeep?: boolean;
        power?: number;
    };
    type KDWeaponVariant = {
        prefix?: string;
        suffix?: string;
        events: KinkyDungeonEvent[];
        template: string;
    };
    type KDConsumableVariant = {
        prefix?: string;
        suffix?: string;
        events: KinkyDungeonEvent[];
        template: string;
    };
    interface KDSpellComponent {
        ignore: (spell: spell, x: number, y: number) => boolean;
        check: (spell: spell, x: number, y: number) => boolean;
        cast?: (spell: spell, data: any) => void;
        stringShort: (ret: string) => string;
        stringLong: (spell: spell) => string;
        partialMiscastChance: (spell: spell, x: number, y: number) => number;
        partialMiscastType: (spell: spell, x: number, y: number) => string;
    }
    type SpecialCondition = {
        resetCD: boolean;
        criteria: (enemy: entity, AIData: any) => boolean;
    };
    type KDEventData_affinity = {
        entity: entity;
        forceTrue: number;
        forceFalse: number;
        affinity: string;
        group: string;
        Message: boolean;
        canStand: boolean;
        msgedstand: boolean;
        groupIsHigh: boolean;
    };
    type KDEventData_PostApply = {
        player: entity;
        item: item | null;
        host: item;
        keep: boolean;
        Link: boolean;
        UnLink: boolean;
    };
    type KDEventData_CurseCount = {
        restraints: {
            item: item;
            host: item;
        }[];
        count: number;
        activatedOnly: boolean;
    };
    interface KDExpressionType {
        EyesPose: string;
        Eyes2Pose: string;
        BrowsPose: string;
        Brows2Pose: string;
        BlushPose: string;
        MouthPose: string;
        FearPose?: string;
    }
    interface KDExpressionPoseType {
        Arms: string;
        Legs: string;
        Eyes: string;
        Eyes2: string;
        Brows: string;
        Brows2: string;
        Blush: string;
        Mouth: string;
        Fear?: string;
    }
    type KDExpression = {
        priority: number;
        stackable?: boolean;
        criteria: (C: any, flags: Map<string, number>) => boolean;
        expression: (C: any, flags: Map<string, number>) => KDExpressionType;
    };
    interface KDPrisonState {
        name: string;
        substate?: boolean;
        substateTimeout?: number;
        refreshState?: string;
        init: (MapParams: floorParams) => string;
        update: (delta: number) => string;
        updateStack?: (delta: number) => void;
        finally?: (delta: number, currentState: string, stackPop: boolean) => void;
    }
    interface KDPrisonType {
        name: string;
        states: Record<string, KDPrisonState>;
        starting_state: string;
        default_state: string;
        update: (delta: number) => string | void;
    }
    interface KDPresetLoadout {
        weapon_current: string;
        weapon_other: string;
        armor: string[];
    }
    interface KDTrainingRecord {
        turns_trained: number;
        turns_skipped: number;
        turns_total: number;
        best_ratio: number;
        training_points: number;
        training_stage: number;
    }
    interface KDRopeType {
        tags: string[];
    }
    interface KDSealGroup {
        arousalMode?: boolean;
        level: number;
        disallowGreater?: boolean;
        disallowLesser?: boolean;
        seals: KDSeal[];
    }
    interface KDSFXGroup {
        sfxEscape?: {
            Struggle?: string;
            Cut?: string;
            Remove?: string;
            Pick?: string;
            Unlock?: string;
            NoStamina?: string;
            NoWill?: string;
            NoMagic?: string;
            MagicCut?: string;
            PickBreak?: string;
            KnifeBreak?: string;
            KnifeDrop?: string;
            KeyDrop?: string;
            PickDrop?: string;
            Blocked?: string;
        };
        sfxFinishEscape?: {
            Struggle?: string;
            Cut?: string;
            Remove?: string;
            Pick?: string;
            Unlock?: string;
            Destroy?: string;
        };
        sfxRemove?: string;
        sfx?: string;
    }
    interface KDEnemyActionType {
        holdleash?: boolean;
        sprint?: boolean;
        end?: (enemy: any) => void;
        filter?: (enemy: any) => boolean;
        maintain: (enemy: any, delta: any) => boolean;
    }
    interface KDSeal {
        name: string;
        aura: string;
        aurasprite: string;
        events: KinkyDungeonEvent[];
    }
    interface KDBoobyTrap {
        minlevel: number;
        filter: (enemy: entity, x: number, y: number, checkpoint: boolean, type: string[]) => boolean;
        weight: (enemy: entity, x: number, y: number, checkpoint: boolean, type: string[]) => number;
        lifetime?: number;
    }
    interface ApplyVariant {
        nonstackable?: boolean;
        hexes: string[];
        enchants: string[];
        level: number;
        powerBonus: number;
        curse?: string;
        noKeep?: boolean;
        prefix?: string;
        suffix?: string;
        minfloor: number;
        maxfloor?: number;
    }
    interface SpecialStat {
        PerFloor: (player: entity, amount: number) => number;
        BuffEvents?: (player: entity) => KinkyDungeonEvent[];
    }
    enum PosNeutNeg {
        positive = 1,
        neutral = 0,
        negative = -1
    }
    enum ModifierEnum {
        restraint = 0,
        weapon = 1,
        consumable = 2
    }
    interface KDEnchantmentType {
        level: number;
        filter: (item: string, allEnchant: string[], data: KDHexEnchantWeightData) => boolean;
        weight: (item: string, allEnchant: string[], data: KDHexEnchantWeightData) => number;
        events: (item: string, Loot: any, curse: string, primaryEnchantment: string, enchantments: string[], data?: KDHexEnchantEventsData) => KinkyDungeonEvent[];
    }
    interface KDHexEnchantEventsData {
        variant: {
            events: KinkyDungeonEvent[];
            template: string;
        };
    }
    interface KDHexEnchantWeightData {
        item: string;
    }
    interface KDEnchantment {
        tags: string[];
        prefix?: string;
        suffix?: string;
        types: Record<ModifierEnum, KDEnchantmentType>;
    }
    interface KDModifierConditionData {
        element?: string;
        elementdmg?: string;
        Loot: string;
        curse: string;
        primaryEnchantment: string;
        enchantments: string[];
    }
    interface KDModifierEffectType {
        level: number;
        onSelect?: (item: string, data: KDModifierConditionData) => void;
        filter: (item: string, positive: PosNeutNeg, data: KDModifierConditionData) => boolean;
        weight: (item: string, positive: PosNeutNeg, data: KDModifierConditionData) => number;
        events: (item: string, positive: PosNeutNeg, data: KDModifierConditionData) => KinkyDungeonEvent[];
    }
    interface KDModifierEffect {
        tags: string[];
        types: Record<ModifierEnum, KDModifierEffectType>;
    }
    interface KDModifierConditionType {
        level: number;
        filter: (item: string, effect_positive: KDModifierEffect[], effect_neutral: KDModifierEffect[], effect_negative: KDModifierEffect[], data: KDModifierConditionData) => boolean;
        weight: (item: string, effect_positive: KDModifierEffect[], effect_neutral: KDModifierEffect[], effect_negative: KDModifierEffect[], data: KDModifierConditionData) => number;
        events: (item: string, effect_positive: KDModifierEffect[], effect_neutral: KDModifierEffect[], effect_negative: KDModifierEffect[], data: KDModifierConditionData) => KinkyDungeonEvent[];
    }
    interface KDModifierCondition {
        tags: string[];
        types: Record<ModifierEnum, KDModifierConditionType>;
    }
    interface KDSpecialEnemyBuff {
        filter: (enemy: entity, type: string[]) => boolean;
        weight: (enemy: entity, type: string[]) => number;
        apply: (enemy: entity, type: string[]) => void;
    }
    type KDCommanderOrderData = {
        delta: number;
        VavgWeight: number;
        globalIgnore: boolean;
        fleeThresh: number;
        combat: boolean;
        aggressive: boolean;
        invalidChoke: Record<string, boolean>;
    };
    interface KDCommanderOrder {
        struggleAssist?: boolean;
        capturer?: boolean;
        filter: (enemy: entity, data: KDCommanderOrderData) => boolean;
        weight: (enemy: entity, data: KDCommanderOrderData) => number;
        apply: (enemy: entity, data: KDCommanderOrderData) => void;
        maintain: (enemy: entity, data: KDCommanderOrderData) => boolean;
        update: (enemy: entity, data: KDCommanderOrderData) => boolean | void;
        remove: (enemy: entity, data: KDCommanderOrderData) => void;
        global_before: (data: KDCommanderOrderData) => void;
        global_after: (data: KDCommanderOrderData) => void;
    }
    type KDCollectionTabDrawDef = (value: KDCollectionEntry, buttonSpacing: number, III: number, x: number, y: number) => number;
    interface KDCollectionEntry {
        name: string;
        origname?: string;
        color: string;
        type: string;
        sprite: string;
        Facility: string;
        customSprite: boolean;
        escaped?: boolean;
        escapegrace?: boolean;
        personality: string;
        Palette?: string;
        metadata: KDOutfitMetadata;
        spawned?: boolean;
        id: number;
        Enemy?: enemy;
        flags?: Record<string, number>;
        customOutfit?: string;
        outfit?: string;
        hairstyle?: string;
        bodystyle?: string;
        facestyle?: string;
        cosplaystyle?: string;
        status: string;
        oldstatus: string;
        class: string;
        Faction: string;
        Opinion: number;
        Training: number;
        Willpower: number;
    }
    interface KDFactionProps {
        jailFaction?: string;
        jailRoom?: string;
        lairType?: string;
        nameList?: string[];
        honor: number;
        honor_specific: Record<string, number>;
        weight: (Floor: number, Checkpoint: string, tags: string[], bonustags: Record<string, {
            bonus: number;
            mult: number;
        }>, X: number, Y: number) => number;
        customHiSecDialogue?: (guard: entity) => string;
        customDefeat?: string;
        jailAlliedFaction?: string;
        jailBackupFaction?: string;
        jailOutfit: string;
    }
    type KDJailGetGroupsReturn = {
        groupsToStrip: string[];
        itemsToApply: {
            item: string;
            variant: string;
        }[];
        itemsToKeep: Record<string, boolean>;
        itemsToStrip: Record<string, boolean>;
    };
    interface KDLeashData {
        priority: number;
        length: number;
        x: number;
        y: number;
        entity?: number;
        reason?: string;
        restraintID?: number;
        color?: string;
    }
    type Lore = {
        condition?: () => boolean;
        image?: string;
        noShow?: boolean;
    };
    type KDJourneySlot = {
        visited: boolean;
        x: number;
        y: number;
        color: string;
        type: string;
        RoomType: string;
        MapMod: string;
        EscapeMethod: string;
        Faction: string;
        SideRooms: string[];
        HiddenRooms: Record<string, boolean>;
        Checkpoint: string;
        Connections: {
            x: number;
            y: number;
        }[];
        protected?: boolean;
    };
    type KDJourneyMap = {
        [_: string]: KDJourneySlot;
    };
    type outfit = {
        name: string;
        dress: string;
        shop: boolean;
        rarity: number;
        events?: KinkyDungeonEvent[];
        costMod?: number;
        palette?: string;
    };
    type KDTile = any;
    type KDTrapType = (tile: KDTile, entity: entity, x: number, y: number) => {
        msg: string;
        triggered: boolean;
    };
    type KDSprites = {
        [_: string]: (x: number, y: number, fog: boolean, noReplace: string) => string;
    };
    type KDTeaseAttackListsType = {
        [_: string]: string[];
    };
    type KDTeaseAttacksType = {
        [_: string]: KDTeaseAttack;
    };
    type KDTeaseAttack = {
        name: string;
        priority: number;
        blockable: boolean;
        dodgeable: boolean;
        filter: (enemy: entity, player: entity, AIData: KDAIData) => boolean;
        apply: (enemy: entity, player: entity, AIData: any, blocked: boolean, evaded: boolean, damageMod: number) => boolean;
    };
    type KDPlayerTitle = {
        unlockCondition: Function;
        priority: number;
        color: string;
        titleActive: Function;
        titleActivate: Function;
        titleDeactivate: Function;
        category: string;
        icon: string;
    };
    type KDPlayerTitleData = {
        sub?: boolean;
        dom?: boolean;
        lampstolen?: boolean;
    };
    const zip: any;
    const guessLanguage: {
        detect(text: string): string;
        info(text: string): [string, string, string];
        code(text: string): [number];
        name(text: string): string;
    };
    const PIXI: typeof import('pixi.js') & typeof import('pixi.js-legacy') & {
        filters: typeof import('pixi-filters');
    };
    type PIXIContainer = import('pixi.js').Container;
    type PIXIMesh = import('pixi.js').Mesh;
    type PIXIRenderTexture = import('pixi.js').RenderTexture;
    type PIXITexture = import('pixi.js').Texture;
    type PIXIText = import('pixi.js').Text;
    type PIXISprite = import('pixi.js').Sprite;
    type PIXIPlane = import('pixi.js').SimplePlane;
    type PIXIBuffer = import('pixi.js').Buffer;
    type IArrayBuffer = import('pixi.js').IArrayBuffer;
    type PIXIArray = import('pixi.js').ITypedArray;
    type PIXIAdjustmentFilter = import('pixi-filters').AdjustmentFilter;
    type PIXIFilter = import('pixi.js').Filter;
    type PIXIMatrix = import('pixi.js').Matrix;
    type PIXIPoint = import('pixi.js').Point;
    type PIXIRenderer = import('pixi.js').Renderer;
    type ISpriteMaskTarget = import('pixi.js').ISpriteMaskTarget;
    type PIXICLEAR_MODES = import('pixi.js').CLEAR_MODES;
    type PIXIFilterSystem = import('pixi.js').FilterSystem;
    type PIXIUnresolvedAsset = any;
    enum PosePriConditions {
        rotation = 0,
        offset_x = 1,
        offset_y = 2,
        offset_either = 3
    }
    type PoseMod = {
        Layer: string;
        offset_x?: number;
        offset_y?: number;
        scale_x?: number;
        scale_y?: number;
        rotation_x_anchor?: number;
        rotation_y_anchor?: number;
        rotation?: number;
    };
    type PoseProperty = {
        filter_pose?: string[];
        rotation?: number;
        rotation_x_anchor?: number;
        rotation_y_anchor?: number;
        pri_rotation?: number;
        offset_y?: number;
        offset_x?: number;
        offset_xFlip?: number;
        pri_offsetx?: number;
        pri_offsety?: number;
        greedy_offset?: boolean;
        mods?: PoseMod[];
        greedy_mod_conditions?: PosePriConditions[];
        global_default?: string;
        flip?: boolean;
    };
    interface Model extends Namable {
        Name: string;
        Folder: string;
        Layers: Record<string, ModelLayer>;
        Protected?: boolean;
        SuperProtected?: boolean;
        Restraint?: boolean;
        Group?: string;
        RemovePoses?: string[];
        Categories: string[];
        TopLevel?: boolean;
        Parent?: string;
        Parent2?: string[];
        AddPose?: string[];
        AddPoseConditional?: Record<string, string[]>;
        AddPoseIf?: Record<string, string[]>;
        HideLayers?: string[];
        HideLayerGroups?: string[];
        DefaultColor?: string[];
        Filters?: Record<string, LayerFilter>;
        Properties?: Record<string, LayerPropertiesType>;
        factionFilters?: Record<string, FactionFilterDef>;
        LockType?: string;
        ImportBodyFilters?: boolean;
    }
    interface ModelLayer extends Namable {
        Name: string;
        Layer: string;
        Folder?: string;
        Pri?: number;
        Sprite?: string;
        LockLayer?: boolean;
        SwapLayerPose?: Record<string, string>;
        PrependLayerPrefix?: Record<string, string>;
        SwapPriorityPose?: Record<string, number>;
        Poses?: Record<string, boolean>;
        DisplacementPoses?: string[];
        DisplacementPosesExclude?: string[];
        ErasePosesExclude?: string[];
        DisplacementSprite?: string;
        DisplaceLayers?: Record<string, boolean>;
        DisplacementMorph?: Record<string, string>;
        DisplaceAmount?: number;
        DisplaceZBonus?: number;
        NoDisplace?: boolean;
        OccludePoses?: string[];
        OccludePosesExclude?: string[];
        OccludeLayers?: Record<string, boolean>;
        OccludeAmount?: number;
        ImportColorFromGroup?: string[];
        ImportColorFromCategory?: string[];
        EraseSprite?: string;
        ErasePoses?: string[];
        EraseLayers?: Record<string, boolean>;
        EraseMorph?: Record<string, string>;
        EraseAmount?: number;
        EraseZBonus?: number;
        NoErase?: boolean;
        EraseInvariant?: boolean;
        HidePoseConditional?: string[][];
        RequirePoses?: Record<string, boolean>;
        HidePoses?: Record<string, boolean>;
        MorphPoses?: Record<string, string>;
        GlobalDefaultOverride?: Record<string, boolean>;
        NoAppendDisplacement?: boolean;
        NoAppendErase?: boolean;
        AppendPose?: Record<string, string>;
        AppendPoseMulti?: Record<string, string>;
        AppendPoseRequire?: Record<string, boolean>;
        HidePrefixPose?: string[];
        HidePrefixPoseSuffix?: string[];
        HideWhenOverridden?: boolean;
        HideOverrideLayer?: string;
        HideOverrideLayerMulti?: string[];
        ForceSingleOverride?: boolean;
        CrossHideOverride?: boolean;
        DontAlwaysOverride?: boolean;
        NoOverride?: boolean;
        TieToLayer?: string;
        Invariant?: boolean;
        DisplacementInvariant?: boolean;
        ApplyFilterToLayerGroup?: Record<string, boolean>;
        ApplyFilter?: string;
        NoColorize?: boolean;
        InheritColor?: string;
        OffsetX?: number;
        OffsetY?: number;
        AnchorModX?: number;
        AnchorModY?: number;
        AddPriWithPose?: Record<string, number>;
    }
    type LayerFilter = {
        gamma: number;
        saturation: number;
        contrast: number;
        brightness: number;
        red: number;
        green: number;
        blue: number;
        alpha: number;
    };
    type LayerPropertiesType = {
        LayerBonus?: number;
        XOffset?: number;
        YOffset?: number;
        XPivot?: number;
        YPivot?: number;
        Rotation?: number;
        XScale?: number;
        YScale?: number;
        Protected?: number;
        SuppressDynamic?: number;
        HideOverridden?: number;
        NoOverride?: number;
        ExtraHidePoses?: string[];
        ExtraRequirePoses?: string[];
        ExtraHidePrefixPose?: string[];
        ExtraHidePrefixPoseSuffix?: string[];
        AddPose?: string[];
        DisplaceAmount?: number;
        EraseAmount?: number;
        NoLoss?: string;
        HideRestraintsTags?: string[];
    };
    interface Namable {
        Name: string;
    }
    const StandalonePatched = true;
    const ArcadeDeviousChallenge = false;
    const ChatRoomCharacter: Character[];
    const ChatRoomChatLog: {
        Garbled: string;
        Time: number;
        SenderName: string;
    }[];
    const DialogGamingPreviousRoom: string;
    const MiniGameReturnFunction: string;
    function ReputationGet(RepType: string): number;
    function DialogSetReputation(a: string, b: number): void;
    let ChatRoomCharacterUpdate: (C: Character) => void;
    function ChatRoomPublishCustomAction(msg: string, LeaveDialog: boolean, Dictionary: any): void;
    const TypedItemDataLookup: {
        [_: string]: any;
    };
    const ModularItemDataLookup: {
        [_: string]: any;
    };
    function TypedItemSetOption(C: PlayerCharacter, item: Item, options: any, option: any, push?: boolean): void;
    function TypedItemSetOptionByName(a: Character, b: Item, c: string, d: boolean): void;
    function ExtendedItemSetType(C: any, Options: any, Option: any): void;
    function ExtendedItemExit(): void;
    let MiniGameVictory: boolean;
    function InventoryRemove(C: Character, AssetGroup: string, Refresh?: boolean): void;
    function InventoryGetLock(Lock: Item): any;
    function InventoryWear(C: Character, AssetName: any, AssetGroup: any, ItemColor?: any, Difficulty?: undefined, MemberNumber?: undefined, Craft?: undefined, Refresh?: boolean): void;
    function InventoryLock(C: Character, Item: Item, Lock: string, MemberNumber: number, Update?: boolean): void;
    function InventoryUnlock(C: Character, Item: string): void;
    let KDPatched: boolean;
    let ServerURL: string;
    function ServerSend(Message: string, Data: any): void;
    function ServerPlayerIsInChatRoom(): boolean;
    function CharacterAppearanceLoadCharacter(C: Character): void;
    function CharacterChangeMoney(C: Character, amount: number): void;
    function DrawImage(Image: string, X: number, Y: number, Invert?: boolean): boolean;
    let CharacterAppearanceBuildCanvas: (C: Character) => void;
    let CharacterRefresh: (C: Character, push?: boolean) => void;
    let DefaultPlayer: PlayerCharacter;
    let KeyPress: number | string;
    let CurrentModule: string;
    let CurrentScreen: string;
    let CurrentCharacter: Character | null;
    let CurrentOnlinePlayers: number;
    let CurrentDarkFactor: number;
    let CommonIsMobile: boolean;
    let CommonCSVCache: {
        [_: string]: string[][];
    };
    let CutsceneStage: number;
    let CommonPhotoMode: boolean;
    let GameVersion: string;
    const GameVersionFormat: RegExp;
    let CommonVersionUpdated: boolean;
    let CommonTouchList: any;
    const CommonChatTags: {
        SOURCE_CHAR: string;
        DEST_CHAR: string;
        DEST_CHAR_NAME: string;
        TARGET_CHAR: string;
        TARGET_CHAR_NAME: string;
        ASSET_NAME: string;
    };
    const CommonFontStacks: {
        Arial: (string | string[])[];
        TimesNewRoman: (string | string[])[];
        Papyrus: (string | string[])[];
        ComicSans: (string | string[])[];
        Impact: (string | string[])[];
        HelveticaNeue: (string | string[])[];
        Verdana: (string | string[])[];
        CenturyGothic: (string | string[])[];
        Georgia: (string | string[])[];
        CourierNew: (string | string[])[];
        Copperplate: (string | string[])[];
    };
    function CommonIsNumeric(n: any): boolean;
    function CommonGetFormatDate(): string;
    function CommonDetectMobile(): boolean;
    function CommonGetBrowser(): {
        Name: string;
        Version: string;
    };
    function CommonParseCSV(str: string): string[][];
    function CommonGet(Path: string, Callback: (this: XMLHttpRequest, xhr: XMLHttpRequest) => void, RetriesLeft?: number): void;
    function CommonGetRetry(Path: string, Callback: (this: XMLHttpRequest, xhr: XMLHttpRequest) => void, RetriesLeft?: number): void;
    function CommonClick(event: MouseEvent | TouchEvent): void;
    function CommonTouchActive(X: number, Y: number, W: number, H: number, TL: any): boolean;
    function CommonKeyDown(event: KeyboardEvent): void;
    function CommonDynamicFunction(FunctionName: string): void;
    function CommonDynamicFunctionParams(FunctionName: string): any;
    function CommonCallFunctionByName(FunctionName: string, ...args: any): any;
    function CommonCallFunctionByNameWarn(FunctionName: string, ...args: any): any;
    function CommonSetScreen(NewModule: string, NewScreen: string): void;
    function CommonTime(): number;
    function CommonIsColor(Value: string): boolean;
    function CommonColorIsValid(Color: any): boolean;
    function CommonRandomItemFromList<T>(ItemPrevious: T, ItemList: T[]): T;
    function CommonColorsEqual(C1: string | string[], C2: string | string[]): boolean;
    function CommonArraysEqual(a1: any[], a2: any[]): boolean;
    function CommonPackItemArray(arr: {
        Group: string;
        Name: string;
        Type?: string | null;
    }[]): {
        [group: string]: {
            [name: string]: string[];
        };
    };
    function CommonUnpackItemArray(arr: {
        [group: string]: {
            [name: string]: string[];
        };
    }): {
        Group: string;
        Name: string;
        Type?: string;
    }[];
    function CommonDeepEqual(obj1: any, obj2: any): boolean;
    function CommonArrayConcatDedupe<T>(dest: T[], src: T[]): T[];
    function CommonNoop(): void;
    function CommonGetServer(): string;
    let MouseX: number;
    let MouseY: number;
    function MouseIn(Left: number, Top: number, Width: number, Height: number): boolean;
    function PointIn(X: number, Y: number, Left: number, Top: number, Width: number, Height: number): boolean;
    function MouseXIn(Left: number, Width: number): boolean;
    function MouseYIn(Top: number, Height: number): boolean;
    function MouseHovering(Left: number, Top: number, Width: number, Height: number): boolean;
    let MainCanvas: CanvasRenderingContext2D;
    let TempCanvas: CanvasRenderingContext2D;
    let ColorCanvas: CanvasRenderingContext2D;
    let CharacterCanvas: CanvasRenderingContext2D;
    let BlindFlash: boolean;
    let DrawingBlindFlashTimer: number;
    const DrawCacheImage: Map<string, HTMLImageElement>;
    let DrawCacheLoadedImages: number;
    let DrawCacheTotalImages: number;
    let DrawLastDarkFactor: number;
    let DrawLastCharacters: Character[];
    let DrawHoverElements: Function[];
    function DrawHexToRGB(color: string): RGBColor;
    function DrawRGBToHex(color: number[]): string;
    let PIXICanvas: any;
    function DrawLoad(): void;
    function DrawGetImageOnLoad(): void;
    function DrawGetImageOnError(Img: HTMLImageElement & {
        errorcount?: number;
    }, IsAsset: boolean): void;
    function DrawCircle(CenterX: number, CenterY: number, Radius: number, LineWidth: number, LineColor: string, FillColor?: string, Canvas?: CanvasRenderingContext2D): void;
    function DrawProgressBar(x: number, y: number, w: number, h: number, value: number, foreground?: string, background?: string): void;
    function DrawProcess(time: number): void;
    function DrawProcessHoverElements(): void;
    let Character: Character[];
    let CharacterNextId: number;
    function CharacterReset(CharacterID: number): Character;
    function CharacterAddPose(C: Character, NewPose: string): void;
    function CharacterItemsHavePoseAvailable(C: Character, Type: string | undefined, Pose: string): boolean;
    function CharacterDoItemsSetPose(C: Character, pose: string, excludeClothes?: boolean): boolean;
    function CharacterNaked(C: Character): void;
    function CharacterSetActivePose(C: Character, NewPose: string, ForceChange?: boolean): void;
    function CharacterSetFacialExpression(C: Character, AssetGroup: string, Expression: string, Timer?: number, Color?: string | string[]): void;
    function CharacterResetFacialExpression(C: Character): void;
    function CharacterGetCurrent(): Character | null;
    function CharacterNickname(C: Character): string;
    function CharacterLoadNPC(id: number, Name: string, Palette?: string, customColors?: Record<string, Record<string, LayerFilter>>): Character;
    function LoadNPC(id: number, Name: string, metadata: KDOutfitMetadata): Character;
    function CharacterReleaseTotal(C: Character): void;
    class TextResPathGenerator {
        static readonly BASE_PATH = "Screens/MiniGame/KinkyDungeon";
        private file_path;
        private file_prefix;
        constructor(base_path: string, file_prefix: string);
        genOriginalPath(): string;
        genTranslationPath(language: string): string;
        genTranslationMap(allowed_languages: LanguageIdentifier[]): Map<LanguageIdentifier, ResourceUrl>;
    }
    type ResourceLoadOptions = {
        requestInit?: RequestInit;
        signal?: AbortSignal;
        nocache?: boolean;
        retries?: number;
    };
    type ResourceParser<T> = (response: Response) => Promise<T>;
    class ResourceLoader {
        private static cache;
        private static parserRegistry;
        static registerParser<T>(type: string, parser: ResourceParser<T>): void;
        static load<T>(url: string, type: string, options?: ResourceLoadOptions): Promise<T>;
        private static fetchWithRetry;
    }
    class TranslationTextParser {
        static parseLines(text: string): string[];
        static parseTranslationText(text: string): LocalizationResources;
    }
    const AvaliableLanguages: readonly ["EN", "CN", "DE", "ES", "JP", "KR", "RU"];
    type LanguageIdentifier = (typeof AvaliableLanguages)[number];
    const NormalSupportedLanguages: ("CN" | "DE" | "ES" | "JP" | "KR" | "RU")[];
    type TextResKey = string;
    type TextResValue = string;
    type TextResMap = Map<TextResKey, TextResValue>;
    type LocalizationResources = {
        textTranslationMap: TextResMap;
        tagTranslationMap: TextResMap;
    };
    type TextGroupId = string;
    type ResourceUrl = string;
    class TextGroupManager {
        private sourceTextGroupMap;
        setGroup(groupId: TextGroupId, sourceText: TextResMap): void;
        removeGroup(groupId: TextGroupId): void;
        getGroup(groupId: TextGroupId): TextResMap;
        appendTextMap(groupId: TextGroupId, sourceText: TextResMap): void;
        appendText(groupId: TextGroupId, key: TextResKey, value: TextResValue): void;
        private mergeMaps;
    }
    class LocalizationService {
        private currentLanguage;
        private localizationMap;
        getCurrentTranslation(): LocalizationResources | null;
        setTranslation(language: LanguageIdentifier, translation: LocalizationResources): void;
        appendTranslation(language: LanguageIdentifier, translation: LocalizationResources): void;
        private mergeLocalizationResources;
        translate(tag: TextResKey, text: TextResValue): string | null;
        setLanguage(lang: LanguageIdentifier): Promise<void>;
    }
    type LocalizationFileUrlMap = Map<LanguageIdentifier, ResourceUrl>;
    type TextResourceConfig = {
        groupId: TextGroupId;
        original: ResourceUrl;
        localizationDictionary: LocalizationFileUrlMap;
        lazyLoad?: boolean;
    };
    type TemplateParams = {
        [key: string]: string | number | boolean;
    };
    class TextResourceLoader<T> {
        private resourcePromiseCache;
        private abortController;
        pushLoad(url: ResourceUrl, loadType: string): Promise<T>;
        abortAll(): void;
        isLoaded(): boolean;
        clearCache(): void;
        waitAll(): Promise<void>;
    }
    class TextProvider {
        private static _instance;
        readonly defaultGroupId = "default";
        private _debugMode;
        private currentLanguage;
        private textGroupManager;
        private translationServiceGroup;
        private originalTextLoader;
        private translationTextLoader;
        private textResourceConfig;
        private constructor();
        private initializeDefaultConfig;
        setDebugMode(debug: boolean): void;
        static get instance(): TextProvider;
        getText(tag: string, params?: TemplateParams, legacy?: boolean): string;
        hasText(tag: string, params?: TemplateParams): boolean;
        queryResourceConfig(groupId: TextGroupId): TextResourceConfig[];
        appendTextResource(config: TextResourceConfig): void;
        getTextFromGroup(groupId: TextGroupId, tag: string, params?: TemplateParams, legacy?: boolean): string;
        getTextFromGroupStrict(groupId: TextGroupId, tag: string, params?: TemplateParams): string;
        getTranslationService(groupId: TextGroupId): LocalizationService;
        getGroupManager(): TextGroupManager;
        loadAndSetupOriginalText(groupId: TextGroupId, url: ResourceUrl): void;
        loadAndSetupTranslationText(groupId: TextGroupId, url: ResourceUrl, language: LanguageIdentifier): void;
        setLanguage(language: LanguageIdentifier): void;
        readyAll(): Promise<TextProvider>;
        static applyTemplate(text: string, params: TemplateParams): string;
    }
    const textProvider: TextProvider;
    function TextGet(TextTag: string, params?: TemplateParams): string;
    function HasText(TextTag: string, params?: TemplateParams): boolean;
    function TextLoad(): void;
    function addTextKey(Name: string, Text: string): void;
    function InventoryGet(C: Character, AssetGroup: string): Item | null;
    let KDTextBoxStyle: {
        backgroundColor: string;
        fontFamily: string;
        fontSize: string;
        color: string;
        lineHeight: number;
    };
    function ElementValue(ID: string, Value?: string | null): string;
    function ElementContent(ID: string, Content?: string): string;
    function ElementCreateTextArea(ID: string): void;
    function ElementCreateInput(ID: string, Type: string, Value: string, MaxLength?: string): HTMLInputElement | undefined;
    function ElementCreateRangeInput(id: string, value: number, min: number, max: number, step: number, thumbIcon?: string, vertical?: boolean): HTMLInputElement;
    function ElementCreateDropdown(ID: string, Options: string[], ClickEventListener?: EventListenerOrEventListenerObject): void;
    function ElementCloseAllSelect(elmnt: object): void;
    function ElementCreateDiv(ID: string): void;
    function ElementRemove(ID: string): void;
    function ElementPosition(ElementID: string, X: number, Y: number, W: number, H?: number): void;
    function ElementPositionFix(ElementID: string, Font: number, X: number, Y: number, W: number, H: number): void;
    function ElementSetDataAttribute(ID: string, Name: string, Value: string): void;
    function ElementSetAttribute(ID: string, Name: string, Value: string): void;
    function ElementScrollToEnd(ID: string): void;
    function ElementGetScrollPercentage(ID: string): number | null;
    function ElementIsScrolledToEnd(ID: string): boolean;
    function ElementFocus(ID: string): void;
    function ElementToggleGeneratedElements(Screen: string, ShouldDisplay: boolean): void;
    let TranslationLanguage: string;
    let TranslationCache: Record<string, string[]>;
    function TranslationLoad(): void;
    function GetUserPreferredLanguage(): any;
    function KDLoadTranslations(text1: string, text2?: string): void;
    let CharacterAppearancePreviousEmoticon: any;
    function CharacterAppearanceSetDefault(C: Character): void;
    function DefaultOutfitMetadata(): KDOutfitMetadata;
    function CharacterAppearanceNaked(C: Character): void;
    function CharacterAppearanceSetItem(C: Character, Group: string, ItemAsset: any, NewColor: string | string[], DifficultyFactor?: number, ItemMemberNumber?: number, Refresh?: boolean): void;
    function CharacterAppearanceStringify(C: Character, metadata: KDOutfitMetadata): string;
    function AppearanceItemStringify(Item: Item[]): string;
    function CharacterAppearanceRestore(C: Character, backup: string, clothesOnly?: boolean, noProtected?: boolean): void;
    function KDRefreshSelectedModel(C: Character): void;
    function AppearanceItemParse(stringified: string): Item[];
    function AppearanceCleanup(C: Character): void;
    enum KDModifierEnum {
        restraint = 0,
        looserestraint = 0,
        weapon = 1,
        consumable = 2
    }
    const cloneDeep: (obj: any) => any;
    const defaultRestraint: restraint;
    function KinkyDungeonCreateRestraint(props: KDRestraintProps, displayName?: string, flavorText?: string, functionText?: string): restraint;
    let KDCursedVariantsCreated: Record<string, Record<string, number>>;
    function KinkyDungeonAddCursedVariants(Restraint: restraint, Variants: string[]): void;
    function KinkyDungeonGetCurses(Restraint: string, includeOrig?: boolean, minLevel?: number, maxLevel?: number): string[];
    function KinkyDungeonGetVariantEffectByList(List: string | string[], Type: ModifierEnum, minLevel?: number, maxLevel?: number): string[];
    function KinkyDungeonGetVariantEffectByListWeighted(List: string | string[], Type: ModifierEnum, item: string, data: KDModifierConditionData, minLevel?: number, maxLevel?: number, positive?: PosNeutNeg): Record<string, number>;
    function KinkyDungeonGetVariantConditionByList(List: string | string[], Type: ModifierEnum, minLevel?: number, maxLevel?: number): string[];
    function KinkyDungeonGetVariantConditionByListWeighted(List: string | string[], Type: ModifierEnum, item: string, data: KDModifierConditionData, minLevel?: number, maxLevel?: number, effect_positive?: KDModifierEffect[], effect_neutral?: KDModifierEffect[], effect_negative?: KDModifierEffect[]): Record<string, number>;
    function KDGenerateEffectConditionPair(ListEffect: string | string[], ListCondition: string | string[], Type: ModifierEnum, item: string, minLevel: number, maxLevel: number, pos: PosNeutNeg, data: KDModifierConditionData): KinkyDungeonEvent[];
    function KinkyDungeonGetHexByList(List: string | string[], includeOrig?: boolean, minLevel?: number, maxLevel?: number): string[];
    function KinkyDungeonGetHexByListWeighted(List: string | string[], item: string, includeOrig?: boolean, minLevel?: number, maxLevel?: number, allHex?: string[]): Record<string, number>;
    function KinkyDungeonGetEnchantmentsByList(List: string | string[], Type: ModifierEnum, includeOrig?: boolean, minLevel?: number, maxLevel?: number): string[];
    function KinkyDungeonGetEnchantmentsByListWeighted(List: string | string[], Type: ModifierEnum, item: string, includeOrig?: boolean, minLevel?: number, maxLevel?: number, allEnchant?: string[]): Record<string, number>;
    function KinkyDungeonGetWeaponsByList(List: string | string[], includeOrig?: boolean, minRarity?: number, maxRarity?: number): string[];
    function KinkyDungeonGetWeaponsByListWeighted(WeaponList: string, includeOrig?: boolean, minRarity?: number, maxRarity?: number): Record<string, number>;
    function KinkyDungeonGetCurseByList(List: string | string[], includeOrig?: boolean, minLevel?: number, maxLevel?: number): string[];
    function KinkyDungeonGetCurseByListWeighted(List: string | string[], item: string, includeOrig?: boolean, minLevel?: number, maxLevel?: number): Record<string, number>;
    function KinkyDungeonCloneRestraint(clonedName: string, newName: string, props: object): restraint;
    function KinkyDungeonAddRestraintText(name: string, displayName: string, flavorText: string, functionText: string): void;
    function KinkyDungeonDupeRestraintText(restraint: string, newRestraint: string): void;
    function HasPerk(perk: string): boolean;
    function KDPlayer(): entity;
    let KDShaders: {
        Adjust: {
            code: string;
        };
        Kawase: {
            code: string;
        };
        Darkness: {
            code: string;
        };
        FogFilter: {
            code: string;
        };
        MultiplyFilter: {
            code: string;
        };
        GammaFilter: {
            code: string;
        };
        Solid: {
            code: string;
        };
    };
    type KDAS_Result = {
        action: string;
        id: string;
        result: string;
        favorability: number;
        delay: number;
    };
    type KDAS_Action = {
        action: string;
        id: string;
        group: string;
        index: number;
    };
    type KDAutoStruggleDataType = {
        lastTick: number;
        lastActionQueue: KDAS_Result[];
        decidedAction: string;
        possibleActions: {
            action: KDAS_Action;
            weight: number;
        }[];
        totalDespair: Record<string, number>;
        currentFocusGroup: string;
        currentFocusIndex: number;
        currentFocusDespair: number;
        currentFocusDespairTarget: number;
        overallDespair: number;
        lastDelay: number;
        wigglePoint: KDPoint;
        wiggleDist: number;
    };
    let KDAutoStruggleData: KDAutoStruggleDataType;
    let KDAutoStruggleActions: Record<string, {
        itemweight?: (player: entity, item: item) => number;
        playerweight?: (player: entity) => number;
        action: (player: entity) => KDAS_Result;
    }>;
    function KDInitAutoStruggle(): void;
    function KDAS_UpdateWigglePoint(player: entity, force?: boolean): void;
    function KDAS_InWigglePoint(player: entity): boolean;
    function KDAS_GetMovableWigglePoint(player: entity, goCloser: boolean): KDPoint[];
    function KDAS_SwitchFavor(result: string): number;
    function KDAS_SwitchDelay(result: string): number;
    function KDHandleAutoStruggle(player: entity): void;
    function KDAutoStruggleEvaluate(player: entity): void;
    function KDAutoStruggleMakeDecision(_player: entity): void;
    function KDAutoStruggleRunDecision(player: entity): KDAS_Result;
    function KDAutoWaitIndexID(_player: entity, group: string, index: number, action: string): string;
    let KDClassReqs: Record<string, () => boolean>;
    let KDClassSynonyms: {
        Mage: string;
    };
    let KDNoMulticlass: {};
    let KDClassStart: Record<string, (start: boolean) => void>;
    let KinkyDungeonClassModeChoice: string;
    function KDDrawClasses(xOffset?: number, yOffset?: number, filter?: (kurasu: string) => boolean, redout?: (kurasu: string) => string, img?: (kurasu: string) => string, click?: (kurasu: string) => boolean): boolean;
    let KDParticles: Map<Number, {
        info: any;
        sprite: any;
    }>;
    let KDParticleid: number;
    let KDParticleEmitters: Map<Number, {
        emitted: any;
        emitter: any;
        sprite: any;
        type: any;
        img: string;
    }>;
    let KDParticleEmitterid: number;
    function KDAddParticle(x: number, y: number, img: string, _type: string, data: KDParticleData): void;
    function KDAddParticleEmitter(x: number, y: number, img: string, imgemitted: string, type: string, emitter: KDParticleEmitterData, emitted: KDParticleData): void;
    function KDUpdateParticles(delta: number): void;
    function KDRemoveParticle(id: number): void;
    function KDRemoveParticleEmitter(id: number): void;
    let lastArousalParticle: number;
    let lastVibeParticle: number;
    function KDDrawArousalParticles(pinkChance: number, density: number, purpleChance: number): void;
    function KDDrawVibeParticles(density: number): void;
    function KDAddShockwave(x: number, y: number, size: number, spr?: string, attachToCamera?: boolean): void;
    function KDSendGagParticles(entity: entity): void;
    function KDCreateVibeParticle(): void;
    function KDCreateArousalParticle(pinkChance: number, purpleChance: number): void;
    let KDLocks: Record<string, KDLockType>;
    function KDCyberHostile(player: entity): boolean;
    function KDCyberAccess(player: entity): boolean;
    function KDCyberLink(player: entity): boolean;
    function KDTryHack(player: entity): boolean;
    function KDCyberUnlock(data: any, base?: number): boolean;
    function KDCyberActions(_data: any, player: entity, base: number): void;
    let KDELEMENTS: string[];
    let KDSPELLELEMENTS: string[];
    let KDSPELLELEMENTSMAP: {
        fire: string;
        water: string;
        earth: string;
        air: string;
        electric: string;
        ice: string;
    };
    let KDELEMENTSMAP: {
        fire: string;
        soap: string;
        crush: string;
        stun: string;
        electric: string;
        ice: string;
    };
    let KDModifierEffectVariantList: {
        Common: string[];
    };
    let KDModifierConditionVariantList: {
        Common: string[];
    };
    let KDModifierEffects: Record<string, KDModifierEffect>;
    let KDModifierConditions: Record<string, KDModifierCondition>;
    function KDGenericEffects(item: string, type: ModifierEnum, pos: KDModifierEffect[], neut: KDModifierEffect[], neg: KDModifierEffect[], data: KDModifierConditionData): KinkyDungeonEvent[];
    let KDBaseCursedVars: string[];
    let KDHexVariantList: {
        Base: string[];
        BaseWithSkimpy: string[];
        BaseWithShibari: string[];
        BaseWithSkimpyShibari: string[];
        Common: string[];
        Dragon: string[];
        CursedCollar: string[];
        CursedCollar2: string[];
    };
    let KDEventHexModular: Record<string, {
        level: number;
        weight: (item: string, allHex: string[], data: KDHexEnchantWeightData) => number;
        events: (data: KDHexEnchantEventsData) => KinkyDungeonEvent[];
    }>;
    let KDEnchantVariantList: {
        Common: string[];
        Pair: string[];
        GenDmg: string[];
        Mana: string[];
        Damage: string[];
        Gold: string[];
        Dragon: string[];
        CommonWeapon: string[];
    };
    function KDGenericMultEnchantmentAmount(amt: number, _item: string, Loot: any, curse: string, primaryEnchantment: string): number;
    function KDNormalizedMultEnchantmentAmount(amt: number, _item: string, Loot: any, curse: string, primaryEnchantment: string): number;
    let KDEventEnchantmentModular: Record<string, KDEnchantment>;
    function KDGetItemPower(item: string): number;
    function KDGetItemRarity(item: string): number;
    function KDEnchantDetermineKind(_item: string, _Loot: any, _curse: string, _primaryEnchantment: string, _enchantments: string[], data: KDHexEnchantEventsData, types: string[]): string;
    let KDAIType: Record<string, AIType>;
    let KDLoadouts: Record<string, KDLoadout>;
    let KDApplyVariants: Record<string, ApplyVariant>;
    const KDMarketRateDecay = 0.98;
    function KDCalcMarketDecayMultiplier(qty_previous: number, qty_this: number, rate?: number): number;
    let KDInventoryAction: Record<string, KDInventoryActionDef>;
    function KDInventoryActionContainer(player: entity): KDContainer;
    let KinkyDungeonPlayerEntity: any;
    let KDBaseBalanceDmgLevel: number;
    let KDShadowThreshold: number;
    let KDSleepWillFraction: number;
    let KDSleepWillFractionJail: number;
    function KDGetSleepWillRegenHealthTo(): number;
    function KDCanSleep(): boolean;
    function KDCanSleepTooltip(): "KDBedSleptLevel" | "KDBedWillNotLow";
    function KDSleep(entity?: entity, amount?: number): void;
    function KDSleepTick(): void;
    let KDOrgAfterglowTime: number;
    let KDShieldRatio: number;
    let KDMaxStat: number;
    let KDMaxStatStart: number;
    let KDMaxStatStartPool: number;
    let KDStamDamageThresh: number;
    let KDStamDamageThreshBonus: number;
    let KinkyDungeonStatDistractionMax: number;
    let KDDistractionLowerPercMult: number;
    let KinkyDungeonStatDistractionLower: number;
    let KinkyDungeonStatDistractionLowerCap: number;
    let KinkyDungeonStatArousalLowerRegenSleep: number;
    let KinkyDungeonDistractionUnlockSuccessMod: number;
    let KinkyDungeonStatDistraction: number;
    let KinkyDungeonCrotchRopeDistraction: number;
    let KinkyDungeonStatDistractionRegen: number;
    let KinkyDungeonStatDistractionRegenPerUpgrade: number;
    let KDNoUnchasteBraMult: number;
    let KDNoUnchasteMult: number;
    let KDDistractionDecayMultDistractionMode: number;
    let KDDistractedAmount: number;
    let KinkyDungeonStatDistractionMiscastChance: number;
    let KinkyDungeonMiscastChance: number;
    let KinkyDungeonVibeLevel: number;
    let KinkyDungeonTeaseLevel: number;
    let KinkyDungeonTeaseLevelBypass: number;
    let KinkyDungeonOrgasmVibeLevel: number;
    let KinkyDungeonDistractionPerVibe: number;
    let KinkyDungeonDistractionPerPlug: number;
    let KinkyDungeonVibeCostPerIntensity: number;
    let KinkyDungeonStatWillpowerExhaustion: number;
    let KinkyDungeonSleepTurnsMax: number;
    let KinkyDungeonStatStaminaMax: number;
    let KinkyDungeonStatStamina: number;
    let KinkyDungeonStatStaminaRegen: number;
    let KinkyDungeonStatStaminaRegenPerUpgrade: number;
    let KinkyDungeonStatStaminaRegenPerUpgradeWill: number;
    let KDNarcolepticRegen: number;
    let KinkyDungeonStatStaminaRegenJail: number;
    let KinkyDungeonStatStaminaRegenSleep: number;
    let KinkyDungeonStatStaminaRegenSleepBedMultiplier: number;
    let KinkyDungeonStatStaminaRegenWait: number;
    let KinkyDungeoNStatStaminaLow: number;
    let KDSprintCostBase: number;
    let KDSprintCostSlowLevel: number[];
    let KDSprintAdjustSlowed: number;
    let KinkyDungeonStatWillMax: number;
    let KinkyDungeonStatWill: number;
    let KinkyDungeonStatWillRate: number;
    let KinkyDungeonStatManaMax: number;
    let KinkyDungeonStatMana: number;
    let KinkyDungeonStatManaPool: number;
    let KinkyDungeonStatManaPoolMax: number;
    let KDManaPoolRatio: number;
    let KinkyDungeonStatManaRate: number;
    let KinkyDungeonStatManaRegen: number;
    let KinkyDungeonStatManaLowRegen: number;
    let KDMeditationRegen: number;
    let KinkyDungeonStatManaRegenLowThreshold: number;
    let KinkyDungeonStatManaPoolRegen: number;
    let KinkyDungeonStatStaminaRegenPerSlowLevel: number;
    let KinkyDungeonStatStaminaCostStruggle: number;
    let KinkyDungeonStatStaminaCostRemove: number;
    let KinkyDungeonStatStaminaCostTool: number;
    let KinkyDungeonStatStaminaCostPick: number;
    let KinkyDungeonStatWillCostStruggle: number;
    let KinkyDungeonStatWillCostRemove: number;
    let KinkyDungeonStatWillCostTool: number;
    let KinkyDungeonStatWillCostPick: number;
    let KinkyDungeonStatWillCostUnlock: number;
    let KinkyDungeonStatWillCostEscape: number;
    let KinkyDungeonStatWillBonusEscape: number;
    let KinkyDungeonStaminaRate: number;
    let KinkyDungeonStatBeltLevel: number;
    let KinkyDungeonStatPlugLevel: number;
    let KinkyDungeonPlugCount: number;
    let KinkyDungeonStatVibeLevel: number;
    let KinkyDungeonStatEdged: boolean;
    let KinkyDungeonStatDistractionGainChaste: number;
    let KinkyDungeonSlowLevel: number;
    let KinkyDungeonBlindLevelBase: number;
    let KinkyDungeonBlindLevel: number;
    let KinkyDungeonStatBlind: number;
    let KinkyDungeonStatFreeze: number;
    let KinkyDungeonStatBind: number;
    let KinkyDungeonDeaf: boolean;
    let KinkyDungeonSleepiness: number;
    let KinkyDungeonSleepinessMax: number;
    let KinkyDungeonGold: number;
    let KinkyDungeonHasCrotchRope: boolean;
    let KinkyDungeonTorsoGrabChance: number;
    let KinkyDungeonTorsoGrabChanceBonus: number;
    let KinkyDungeonWeaponGrabChance: number;
    let KinkyDungeonInventory: Map<string, Map<string, item>>;
    function KDInitInventory(): void;
    let KinkyDungeonPlayerTags: Map<any, any>;
    let NPCTags: Map<Character, Map<string, boolean>>;
    let KinkyDungeonCurrentDress: string;
    let KinkyDungeonUndress: number;
    let KinkyDungeonSpells: spell[];
    let KinkyDungeonPlayerBuffs: Record<string, KDBuff>;
    let KinkyDungeonPlayers: any[];
    let KinkyDungeonDifficulty: number;
    let KinkyDungeonSubmissiveMult: number;
    let KinkyDungeonSpellPoints: number;
    function KinkyDungeonDefaultStats(_Load?: any): void;
    function KinkyDungeonGetVisionRadius(): number;
    function KDEntitySenses(entity: entity): {
        radius: number;
        mult: number;
        vision: number;
        visionmult: number;
        blindsight: number;
    };
    function KDDeafLevel(): number;
    function KinkyDungeonGetHearingRadius(entity?: entity): {
        radius: number;
        mult: number;
    };
    function KDIsAutoAction(): boolean;
    function KDCancelAutoWait(): void;
    function KDDisableAutoWait(): void;
    function KinkyDungeonInterruptSleep(): void;
    let KDBaseDamageTypes: {
        knockbackTypes: string[];
        knockbackTypesStrong: string[];
        arouseTypes: string[];
        bypassTeaseTypes: string[];
        distractionTypesWeakNeg: string[];
        distractionTypesWeak: string[];
        distractionTypesStrong: string[];
        teaseTypes: string[];
        staminaTypesWeak: string[];
        staminaTypesStrong: string[];
        manaTypesWeak: string[];
        manaTypesStrong: any[];
        willTypesVeryWeak: string[];
        willTypesWeak: string[];
        willTypesStrong: string[];
    };
    function KDGetStamDamageThresh(): number;
    function KDBulletAlreadyHit(bullet: KDBullet, entity: entity, suppressAdd?: boolean): boolean;
    interface damageInfoMinor {
        damage: number;
        type: string;
        time?: number;
        flags?: string[];
        src?: string;
        srctype?: string;
        srctrig?: string;
        distract?: number;
        crit?: number;
        addBind?: boolean;
        bindcrit?: number;
        bind?: number;
        bindType?: string;
    }
    interface damageInfo extends damageInfoMinor {
        name?: string;
        flags?: string[];
        time?: number;
        bind?: number;
        bindEff?: number;
        sfx?: string;
        crit?: number;
        bindcrit?: number;
        bindType?: string;
        distract?: number;
        distractEff?: number;
        desireMult?: number;
        addBind?: boolean;
        realBind?: boolean;
        nodisarm?: boolean;
        nocrit?: boolean;
        noblock?: boolean;
        evadeable?: boolean;
        nokill?: boolean;
        ignoreshield?: boolean;
        boundBonus?: number;
        novulnerable?: boolean;
        tease?: boolean;
        shield_crit?: boolean;
        shield_stun?: boolean;
        shield_freeze?: boolean;
        shield_bind?: boolean;
        shield_snare?: boolean;
        shield_slow?: boolean;
        shield_distract?: boolean;
        shield_vuln?: boolean;
        bindTags?: string[];
        power?: number;
    }
    function KinkyDungeonDealDamage(Damage: damageInfoMinor, bullet?: KDBullet, noAlreadyHit?: boolean, noInterrupt?: boolean, noMsg?: boolean): {
        happened: number;
        string: string;
    };
    function KinkyDungeonUpdateDialogue(entity: entity, delta: number): void;
    function KinkyDungeonSendDialogue(entity: entity, dialogue: string, color: string, duration: number, priority: number, force?: boolean, nooverride?: boolean): void;
    let KDOrigStamina: number;
    let KDOrigMana: number;
    let KDOrigWill: number;
    let KDOrigCharge: number;
    let KDOrigBalance: number;
    let KDOrigDistraction: number;
    let KDOrigDesire: number;
    function KDChangeDistraction(src: string, type: string, trig: string, Amount: number, NoFloater?: boolean, lowerPerc?: number, minimum?: number, noEvent?: boolean): number;
    function KDChangeDesire(src: string, type: string, trig: string, Amount: number, NoFloater: boolean): number;
    function KDChangeStamina(src: string, type: string, trig: string, Amount: number, NoFloater?: boolean, Pause?: number, NoSlow?: boolean, minimum?: number, slowFloor?: number, Regen?: boolean): void;
    function KDChangeMana(src: string, type: string, trig: string, Amount: number, NoFloater?: boolean, PoolAmount?: number, Pause?: boolean, spill?: boolean, minimum?: number): void;
    function KDChangeWill(src: string, type: string, trig: string, Amount: number, NoFloater?: boolean, minimum?: number): number;
    function KDChangeBalanceSrc(src: string, type: string, trig: string, Amount: number, NoFloater: boolean): number;
    function KDChangeCharge(src: string, type: string, trig: string, Amount: number, NoFloater?: boolean): void;
    function KinkyDungeonHasStamina(Cost: number, AddRate?: boolean): boolean;
    function KinkyDungeonHasWill(Cost: number, AddRate?: boolean): boolean;
    function KinkyDungeonHasMana(Cost: number, AddRate?: boolean): boolean;
    function KinkyDungeonSetMaxStats(delta?: any): {
        distractionRate: number;
        staminaRate: number;
    };
    function KinkyDungeonCanUseWeapon(NoOverride?: boolean, e?: boolean, weapon?: weapon): boolean;
    let KDBlindnessCap: number;
    let KDBoundPowerLevel: number;
    let KDNoRegenFlag: boolean;
    function KDGetDistractionRate(delta: number): number;
    function KDGetDistractionDesireRate(): number;
    function KinkyDungeonUpdateStats(delta: number): void;
    let KDDamageAmpPerks: number;
    let KDDamageAmpPerksMelee: number;
    let KDDamageAmpPerksMagic: number;
    let KDDamageAmpPerksSpell: number;
    let KDDamageAmpEnvironmental: number;
    let KDExtraEnemyTags: Record<string, any>;
    function KDGetEnvironmentalDmg(): number;
    function KDUpdatePerksBonus(): void;
    function KinkyDungeonCalculateMiscastChance(): void;
    function KinkyDungeonGetBlindLevel(): number;
    function KinkyDungeonCapStats(): void;
    function KDIsHogtied(C?: Character): boolean;
    function KDIsKneeling(C?: any): boolean;
    function KinkyDungeonLegsBlocked(): boolean;
    function KinkyDungeonCanStand(): boolean;
    function KinkyDungeonCanKneel(): boolean;
    function KinkyDungeonCalculateHeelLevel(_delta: number, overrideKneel?: boolean): number;
    function KinkyDungeonCalculateSlowLevel(delta?: number): void;
    function KinkyDungeonGagTotal(AllowFlags?: boolean, gagMult?: number): number;
    function KDIsGaggedFast(): boolean;
    function KinkyDungeonCanTalk(Loose?: boolean): boolean;
    function KinkyDungeonCalculateSubmissiveMult(): number;
    function KinkyDungeonCanPlayWithSelf(): boolean;
    function KinkyDungeonCanTryOrgasm(): boolean;
    function KDGetOrgasmCost(): number;
    function KDGetPlaySelfPower(tease?: number): {
        orig: number;
        final: number;
    };
    function KinkyDungeonDoPlayWithSelf(tease?: number): number;
    let KinkyDungeonOrgasmVibeLevelPlayPowerMult: number;
    let KinkyDungeonOrgasmChanceBase: number;
    let KinkyDungeonOrgasmChanceScaling: number;
    let KinkyDungeonMaxOrgasmStage: number;
    let KinkyDungeonOrgasmStageVariation: number;
    let KinkyDungeonDistractionSleepDeprivationThreshold: number;
    let KinkyDungeonDistractionPlaySelfThreshold: number;
    let KinkyDungeonPlaySelfOrgasmThreshold: number;
    let KinkyDungeonOrgasmTurnsMax: number;
    let KinkyDungeonOrgasmTurnsCrave: number;
    let KinkyDungeonPlayWithSelfPowerMin: number;
    let KinkyDungeonPlayWithSelfPowerMax: number;
    let KDDesireScalingOrgasmPower: number;
    let KinkyDungeonPlayWithSelfPowerVibeWand: number;
    let KinkyDungeonPlayWithSelfChastityPenalty: number;
    let KinkyDungeonPlayWithSelfBoundPenalty: number;
    let KinkyDungeonOrgasmExhaustionAmount: number;
    let KinkyDungeonOrgasmExhaustionAmountWillful: number;
    let KDOrgasmStageTimerMax: number;
    let KDWillpowerInvolChanceMult: number;
    let KDInvolChanceBase: number;
    let KDPassionInvolChanceMult: number;
    let KDWillpowerMultiplier: number;
    let KinkyDungeonOrgasmCost: number;
    let KinkyDungeonOrgasmCostPercent: number;
    let KinkyDungeonOrgasmWillpowerCost: number;
    let KinkyDungeonEdgeCost: number;
    let KinkyDungeonEdgeWillpowerCost: number;
    let KinkyDungeonPlayCost: number;
    let KinkyDungeonOrgasmStunTime: number;
    let KinkyDungeonPlayWithSelfMult: number;
    function KDGetPlaySelfThreshold(): number;
    function KinkyDungeonDoTryOrgasm(Bonus?: number, Auto?: number): void;
    function KinkyDungeonIsChaste(Breast: boolean): boolean;
    function KinkyDungeonChastityMult(): number;
    function KDBuffResist(buffs: any, type: string): number;
    function KDIsEdged(_player: entity): boolean;
    function KDForcedToGround(): any;
    function KDBalanceDmgMult(): number;
    function KDFitnessMult(_player?: any): number;
    function KDMentalMult(_player: entity): number;
    function KDEnduranceMult(_player: entity): number;
    function KDReflexMult(_player: entity): number;
    function KDPowerMult(_player: entity): number;
    function KDIsBlindfolded(_player: entity): boolean;
    function KDCanHack(_player: entity): boolean;
    function KDGetInertia(player: entity): number;
    interface KDKneelData {
        baseRate: number;
        kneelRate: number;
        delta: number;
        msg: boolean;
        minKneel: number;
    }
    function KDIsGrounded(): boolean;
    function KDGetKneelStats(delta: number, msg: boolean): KDKneelData;
    let KDBaseTrainingMinRatioPercent: number;
    let KDTrainingTypes: string[];
    function KDGetHeelTraining(): number;
    function KDTrip(delta: number): void;
    function KDGetRecoverBalance(): number;
    function KDGetBalanceRate(): number;
    function KDTripDuration(): number;
    function KDGetBalanceCost(): number;
    function KDGetTrainingPercentage(name: string, data: KDTrainingRecord, player: entity, useMin?: boolean, noSoftScale?: boolean): number;
    function KDGetTrainingMinRatioPercent(name: string, data: KDTrainingRecord, player: entity): number;
    function KDGetTrainingMinRatioPercentTick(name: string, data: KDTrainingRecord, player: entity): number;
    function KDAdvanceTraining(player: entity): void;
    function KDTickTraining(Name: string, trained: boolean, skipped: boolean, total: number, bonus?: number): void;
    let KDTrainingSoftScale: number;
    let KDMapTilesList: Record<string, KDMapTile>;
    let KDMapTilesListEditor: Record<string, KDMapTile>;
    let KDTileToTest: any;
    function KDInitTileEditor(): void;
    let KDEditorTileIndex: string;
    let KDEditorTileFlex: string;
    let KDEditorTileFlexSuper: string;
    let KDEditorTileIndexQuery: string;
    let KDEditorTileIndexStore: Record<string, string>;
    let KDEditorTileFlexStore: Record<string, string>;
    let KDEditorTileFlexSuperStore: Record<string, string>;
    let KDEditorCurrentMapTileName: string;
    let KDEditorCurrentMapTile: any;
    let KDTileIndices: {
        udlr: boolean;
        u: boolean;
        d: boolean;
        l: boolean;
        r: boolean;
        ud: boolean;
        lr: boolean;
        ul: boolean;
        ur: boolean;
        dl: boolean;
        dr: boolean;
        udl: boolean;
        udr: boolean;
        dlr: boolean;
        ulr: boolean;
    };
    let KDEditorTileIndexHover: string;
    let KDEditorTileNameIndex: number;
    let KDEditorTileBrush: string;
    let KDEditorTileBrushIndex: number;
    let KDEditorTileBrushIndex2: number;
    let KDTilePalette: {
        Clear: {
            type: string;
            tile: string;
        };
        Wall: {
            type: string;
            tile: string;
        };
        WallReinforced: {
            type: string;
            tile: string;
        };
        '----Spawns----': {
            type: string;
        };
        Spawn: {
            type: string;
            tile: string;
            special: {
                Type: string;
                required: any[];
            };
        };
        SpawnGuard: {
            type: string;
            tile: string;
            special: {
                Type: string;
                required: any[];
                AI: string;
            };
        };
        Prisoner: {
            type: string;
            tile: string;
            special: {
                Type: string;
            };
        };
        SpawnLooseGuard: {
            type: string;
            tile: string;
            special: {
                Type: string;
                required: any[];
                AI: string;
            };
        };
        SpawnMiniboss: {
            type: string;
            tile: string;
            special: {
                Type: string;
                required: string[];
                AI: string;
            };
        };
        SpawnBoss: {
            type: string;
            tile: string;
            special: {
                Type: string;
                required: string[];
                AI: string;
            };
        };
        '----SpecifcSpawns----': {
            type: string;
        };
        SpawnStatue: {
            type: string;
            tile: string;
            special: {
                Type: string;
                required: string[];
                Label: string;
                tags: string[];
            };
        };
        SpawnStatueRare: {
            type: string;
            tile: string;
            special: {
                Type: string;
                required: string[];
                Label: string;
                tags: string[];
                Chance: number;
            };
        };
        SpawnObstacleDoor: {
            type: string;
            tile: string;
            special: {
                Type: string;
                required: string[];
                tags: string[];
                Label: string;
            };
        };
        SpawnSoulCrys: {
            type: string;
            tile: string;
            special: {
                Type: string;
                required: string[];
                tags: string[];
                Label: string;
            };
        };
        SpawnSoulCrysActive: {
            type: string;
            tile: string;
            special: {
                Type: string;
                required: string[];
                tags: string[];
                Label: string;
            };
        };
        SpawnChaosCrysRare: {
            type: string;
            tile: string;
            special: {
                Type: string;
                required: string[];
                tags: string[];
                Label: string;
                Chance: number;
            };
        };
        SpawnChaosCrys: {
            type: string;
            tile: string;
            special: {
                Type: string;
                required: string[];
                tags: string[];
                Label: string;
            };
        };
        SpawnChaosCrysActive: {
            type: string;
            tile: string;
            special: {
                Type: string;
                required: string[];
                tags: string[];
                Label: string;
            };
        };
        SpawnMushroom: {
            type: string;
            tile: string;
            special: {
                Type: string;
                required: string[];
                tags: string[];
                Label: string;
            };
        };
        SpawnMushroomRare: {
            type: string;
            tile: string;
            special: {
                Type: string;
                required: string[];
                tags: string[];
                Label: string;
                Chance: number;
            };
        };
        SpawnCustom: {
            type: string;
            tile: string;
            special: {
                Type: string;
                required: any[];
                Label: string;
            };
            customfields: {
                required: {
                    type: string;
                };
                tags: {
                    type: string;
                };
                filterTags: {
                    type: string;
                };
                Label: {
                    type: string;
                };
                Chance: {
                    type: string;
                };
                AI: {
                    type: string;
                };
                force: {
                    type: string;
                };
                faction: {
                    type: string;
                };
                levelBoost: {
                    type: string;
                };
                forceIndex: {
                    type: string;
                };
            };
        };
        ForceSpawnCustom: {
            type: string;
            tile: string;
            special: {
                Type: string;
                required: any[];
                Label: string;
            };
            customfields: {
                required: {
                    type: string;
                };
                tags: {
                    type: string;
                };
                filterTags: {
                    type: string;
                };
                Label: {
                    type: string;
                };
                Chance: {
                    type: string;
                };
                AI: {
                    type: string;
                };
                force: {
                    type: string;
                };
                faction: {
                    type: string;
                };
                levelBoost: {
                    type: string;
                };
                forceIndex: {
                    type: string;
                };
            };
        };
        '----Tiles----': {
            type: string;
        };
        Brick: {
            type: string;
            tile: string;
        };
        Doodad: {
            type: string;
            tile: string;
        };
        Grate: {
            type: string;
            tile: string;
        };
        Bars: {
            type: string;
            tile: string;
        };
        Bed: {
            type: string;
            tile: string;
        };
        ClamBed: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Skin: string;
            };
        };
        Crack: {
            type: string;
            tile: string;
        };
        LatexPipe: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Skin: string;
            };
        };
        LatexThin: {
            type: string;
            effectTile: string;
        };
        LatexThinBlue: {
            type: string;
            effectTile: string;
        };
        LatexThinGreen: {
            type: string;
            effectTile: string;
        };
        Latex: {
            type: string;
            effectTile: string;
        };
        LatexBlue: {
            type: string;
            effectTile: string;
        };
        LatexGreen: {
            type: string;
            effectTile: string;
        };
        WallHook: {
            type: string;
            tile: string;
        };
        CeilingHook: {
            type: string;
            tile: string;
        };
        '----Deco----': {
            type: string;
        };
        'Rubble(mend)': {
            type: string;
            effectTile: string;
        };
        'Rubble(nomend)': {
            type: string;
            effectTile: string;
        };
        Pipe: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Skin: string;
            };
        };
        InactiveTablet: {
            type: string;
            tile: string;
        };
        BrokenShrine: {
            type: string;
            tile: string;
        };
        BrokenOrb: {
            type: string;
            tile: string;
        };
        BrokenCharger: {
            type: string;
            tile: string;
        };
        Dummy0: {
            type: string;
            tile: string;
            special: {
                Type: string;
                SkinCode: string;
                Skin2: string;
            };
        };
        Dummy1: {
            type: string;
            tile: string;
            special: {
                Type: string;
                SkinCode: string;
                Skin2: string;
            };
        };
        Dummy2: {
            type: string;
            tile: string;
            special: {
                Type: string;
                SkinCode: string;
                Skin2: string;
            };
        };
        '----Doors----': {
            type: string;
        };
        Door: {
            type: string;
            tile: string;
            special: {
                Type: string;
            };
        };
        DoorAlways: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Priority: boolean;
                AlwaysClose: boolean;
            };
        };
        CyberDoor: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Priority: boolean;
                AlwaysClose: boolean;
                Lock: string;
                DoorSkin: string;
            };
        };
        Door_RedLock: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Priority: boolean;
                AlwaysClose: boolean;
                Lock: string;
            };
        };
        Door_PurpleLock: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Priority: boolean;
                AlwaysClose: boolean;
                Lock: string;
            };
        };
        Door_BlueLock: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Priority: boolean;
                AlwaysClose: boolean;
                Lock: string;
            };
        };
        AutoDoorToggle: {
            type: string;
            tile: string;
            special: {
                Type: string;
                wireType: string;
            };
        };
        AutoDoorOpenToggle: {
            type: string;
            tile: string;
            special: {
                Type: string;
                wireType: string;
            };
        };
        AutoDoorHoldOpen: {
            type: string;
            tile: string;
            special: {
                Type: string;
                wireType: string;
                Label: string;
            };
        };
        AutoDoorHoldClosed: {
            type: string;
            tile: string;
            special: {
                Type: string;
                wireType: string;
                Label: string;
            };
        };
        AutoDoorOpen: {
            type: string;
            tile: string;
            special: {
                Type: string;
                wireType: string;
                Label: string;
            };
        };
        AutoDoorClose: {
            type: string;
            tile: string;
            special: {
                Type: string;
                wireType: string;
                Label: string;
            };
        };
        '----Furniture----': {
            type: string;
        };
        Table: {
            type: string;
            tile: string;
            special: {
                Type: string;
            };
        };
        TableFood: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Food: string;
            };
        };
        Rubble: {
            type: string;
            tile: string;
            special: {
                Type: string;
            };
        };
        Sharp: {
            type: string;
            tile: string;
            special: {
                Type: string;
            };
        };
        SharpAlways: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Always: boolean;
            };
        };
        Barrel: {
            type: string;
            tile: string;
            special: {
                Type: string;
            };
        };
        BarrelAlways: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Always: boolean;
            };
        };
        Cage: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Furniture: string;
            };
            jail: {
                type: string;
                radius: number;
            };
        };
        FutureBox: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Furniture: string;
            };
            jail: {
                type: string;
                radius: number;
            };
        };
        FutureBoxStorage: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Furniture: string;
                jail: {
                    type: string;
                    radius: number;
                };
            };
            jail: {
                type: string;
                radius: number;
            };
        };
        DisplayStand: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Furniture: string;
            };
            jail: {
                type: string;
                radius: number;
            };
        };
        LatexDisplayStand: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Furniture: string;
            };
            jail: {
                type: string;
                radius: number;
            };
        };
        DisplayEgyptian: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Furniture: string;
            };
            jail: {
                type: string;
                radius: number;
            };
        };
        IceBase: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Furniture: string;
            };
            jail: {
                type: string;
                radius: number;
            };
        };
        CrystalBase: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Furniture: string;
            };
            jail: {
                type: string;
                radius: number;
            };
        };
        VineBase: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Furniture: string;
            };
            jail: {
                type: string;
                radius: number;
            };
        };
        ShadowBase: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Furniture: string;
            };
            jail: {
                type: string;
                radius: number;
            };
        };
        Sarco: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Furniture: string;
            };
            jail: {
                type: string;
                radius: number;
            };
        };
        '----Chests----': {
            type: string;
        };
        Chest: {
            type: string;
            tile: string;
            special: {
                Type: string;
            };
        };
        ChestRed: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Lock: string;
            };
        };
        ChestBlue: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Lock: string;
            };
        };
        ChestOrShrine: {
            type: string;
            tile: string;
            special: {
                Type: string;
            };
        };
        HighPriorityChest: {
            type: string;
            tile: string;
            special: {
                Priority: boolean;
            };
        };
        SilverChest: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Loot: string;
                Priority: boolean;
            };
        };
        StorageChest: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Loot: string;
                Chance: number;
                refill: boolean;
            };
        };
        KinkyChest: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Loot: string;
                Chance: number;
                refill: boolean;
            };
        };
        ChestCustom: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Loot: string;
            };
            customfields: {
                Loot: {
                    type: string;
                };
                Faction: {
                    type: string;
                };
                NoTrap: {
                    type: string;
                };
                lootTrap: {
                    type: string;
                };
                Lock: {
                    type: string;
                };
                Priority: {
                    type: string;
                };
            };
        };
        GuardedChest: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Label: string;
            };
        };
        GuardedChestLocked: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Lock: string;
                Label: string;
            };
        };
        '----Shrines----': {
            type: string;
        };
        Shrine: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Name: string;
            };
        };
        HighPriorityShrine: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Name: string;
                Priority: boolean;
            };
        };
        '----Hazards----': {
            type: string;
        };
        SpikeTrap: {
            type: string;
            effectTile: string;
        };
        Trap: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Always: boolean;
            };
        };
        PotentialTrap: {
            type: string;
            tile: string;
            special: {
                Type: string;
            };
        };
        '----Conveyors----': {
            type: string;
        };
        ConveyorUp: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Sprite: string;
                DX: number;
                DY: number;
            };
        };
        ConveyorDown: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Sprite: string;
                DX: number;
                DY: number;
            };
        };
        ConveyorLeft: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Sprite: string;
                DX: number;
                DY: number;
            };
        };
        ConveyorRight: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Sprite: string;
                DX: number;
                DY: number;
            };
        };
        SafetyConveyorUp: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Sprite: string;
                DX: number;
                DY: number;
            };
        };
        SafetyConveyorDown: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Sprite: string;
                DX: number;
                DY: number;
            };
        };
        SafetyConveyorLeft: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Sprite: string;
                DX: number;
                DY: number;
            };
        };
        SafetyConveyorRight: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Sprite: string;
                DX: number;
                DY: number;
            };
        };
        ConveyorUpOn: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Sprite: string;
                DX: number;
                DY: number;
                wireType: string;
                SwitchMode: string;
            };
        };
        ConveyorDownOn: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Sprite: string;
                DX: number;
                DY: number;
                wireType: string;
                SwitchMode: string;
            };
        };
        ConveyorLeftOn: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Sprite: string;
                DX: number;
                DY: number;
                wireType: string;
                SwitchMode: string;
            };
        };
        ConveyorRightOn: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Sprite: string;
                DX: number;
                DY: number;
                wireType: string;
                SwitchMode: string;
            };
        };
        ConveyorUpOff: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Sprite: string;
                DX: number;
                DY: number;
                wireType: string;
                SwitchMode: string;
            };
        };
        ConveyorDownOff: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Sprite: string;
                DX: number;
                DY: number;
                wireType: string;
                SwitchMode: string;
            };
        };
        ConveyorLeftOff: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Sprite: string;
                DX: number;
                DY: number;
                wireType: string;
                SwitchMode: string;
            };
        };
        ConveyorRightOff: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Sprite: string;
                DX: number;
                DY: number;
                wireType: string;
                SwitchMode: string;
            };
        };
        ConveyorUpSwitch: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Sprite: string;
                DX: number;
                DY: number;
                wireType: string;
                SwitchMode: string;
            };
        };
        ConveyorDownSwitch: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Sprite: string;
                DX: number;
                DY: number;
                wireType: string;
                SwitchMode: string;
            };
        };
        ConveyorLeftSwitch: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Sprite: string;
                DX: number;
                DY: number;
                wireType: string;
                SwitchMode: string;
            };
        };
        ConveyorRightSwitch: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Sprite: string;
                DX: number;
                DY: number;
                wireType: string;
                SwitchMode: string;
            };
        };
        '----Machines----': {
            type: string;
        };
        DollSupply: {
            type: string;
            tile: string;
            special: {
                Type: string;
            };
        };
        DollSupplyManual: {
            type: string;
            tile: string;
            special: {
                Type: string;
                count: number;
                wireType: string;
                rate: number;
            };
        };
        DollTerminal: {
            type: string;
            tile: string;
            special: {
                Type: string;
            };
        };
        BondageMachineLatex: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Binding: string;
            };
        };
        BondageMachinePlug: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Binding: string;
            };
        };
        BondageMachineChastity: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Binding: string;
            };
        };
        BondageMachineTape: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Binding: string;
            };
        };
        BondageMachineMetal: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Binding: string;
            };
        };
        BondageMachineDoll: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Binding: string;
            };
        };
        DollDropoffU: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Sprite: string;
                Overlay: string;
                direction: {
                    x: number;
                    y: number;
                };
            };
        };
        DollDropoffD: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Sprite: string;
                Overlay: string;
                direction: {
                    x: number;
                    y: number;
                };
            };
        };
        DollDropoffR: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Sprite: string;
                Overlay: string;
                direction: {
                    x: number;
                    y: number;
                };
            };
        };
        DollDropoffL: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Sprite: string;
                Overlay: string;
                direction: {
                    x: number;
                    y: number;
                };
            };
        };
        '----Signals----': {
            type: string;
        };
        Button: {
            type: string;
            tile: string;
        };
        Wire: {
            type: string;
            effectTile: string;
        };
        WireVert: {
            type: string;
            effectTile: string;
        };
        WireHoriz: {
            type: string;
            effectTile: string;
        };
        PressurePlate: {
            type: string;
            effectTile: string;
        };
        PressurePlateHold: {
            type: string;
            effectTile: string;
        };
        PressurePlateOneUse: {
            type: string;
            effectTile: string;
        };
        ManaPlate: {
            type: string;
            effectTile: string;
        };
        TeleportPlate: {
            type: string;
            effectTile: string;
        };
        NoTeleportPlate: {
            type: string;
            effectTile: string;
        };
        TeleportPlateMana: {
            type: string;
            effectTile: string;
        };
        '----Lighting----': {
            type: string;
        };
        Torch: {
            type: string;
            effectTile: string;
        };
        PotentialTorch: {
            type: string;
            effectTile: string;
        };
        PriorityCharger: {
            type: string;
            tile: string;
            special: {
                Type: string;
                Priority: boolean;
            };
        };
        Charger: {
            type: string;
            tile: string;
            special: {
                Type: string;
            };
        };
        UnlockedCharger: {
            type: string;
            tile: string;
            special: {
                Type: string;
                NoRemove: boolean;
            };
        };
        MotionLamp: {
            type: string;
            effectTile: string;
        };
        '----Misc----': {
            type: string;
        };
        POI: {
            type: string;
        };
        OL: {
            type: string;
        };
        NW: {
            type: string;
        };
        Jail: {
            type: string;
        };
        JailPoint: {
            type: string;
            tile: string;
            special: {
                Type: string;
            };
        };
        Keyring: {
            type: string;
        };
        MazeSeed: {
            type: string;
            customfields: {
                newest: {
                    type: string;
                };
                oldest: {
                    type: string;
                };
                scale: {
                    type: string;
                };
                branchchance: {
                    type: string;
                };
                hbias: {
                    type: string;
                };
                vbias: {
                    type: string;
                };
                wobble: {
                    type: string;
                };
                pillarToDoodad: {
                    type: string;
                };
            };
        };
        MazeBlock: {
            type: string;
        };
        Label: {
            type: string;
            customfields: {
                name: {
                    type: string;
                };
                type: {
                    type: string;
                };
                faction: {
                    type: string;
                };
                guard: {
                    type: string;
                };
                interesting: {
                    type: string;
                };
            };
        };
    };
    function KDGetTileIndexImg(index: string): {
        u: boolean;
        d: boolean;
        l: boolean;
        r: boolean;
    };
    let KDTE_State: string;
    function KDDrawTileEditor(): void;
    function KDDrawEditorTagsUI(): void;
    let KDEditorTileBrushIndexVisual: number;
    let KDEditorTileBrushIndex2Visual: number;
    let KDEditorTileNameIndexVisual: number;
    function KDDrawEditorUI(): void;
    let customfieldsElements: any[];
    function KDTE_CustomUI(): void;
    let KDTE_lastMouse: number;
    let KDTEHoldDelay: number;
    let KDTEmode: number;
    let KDTE_Scale: number;
    let KDTE_MAXDIM: number;
    let KDTELoadConfirm: boolean;
    function KDTE_Clear(x: number, y: number, force?: boolean): void;
    let KDTE_Brush: Record<string, (brush: any, curr: string, noSwap: boolean) => void>;
    let KDTE_Inaccessible: boolean;
    let KDTE_confirmreset: boolean;
    let KDTE_confirmcommit: boolean;
    function KDHandleTileEditor(noSwap?: boolean): void;
    function KDTE_UpdateUI(Load: boolean): void;
    function KDTESetIndexToTile(propTile: string): void;
    function KDTE_CullIndex(tileKeys: string[], brushKeys: string[]): void;
    function KDTE_CloseUI(): void;
    function KDTE_Create(w: number, h: number, chkpoint?: string, closed?: boolean, empty?: boolean): void;
    function KDTE_LoadTile(name: any, loadedTile?: KDMapTile): void;
    function KDTE_ExportTile(): KDMapTile;
    function KDTE_SaveTile(_tile?: string): void;
    type InaccessibleEntry = {
        indX1: number;
        indY1: number;
        dir1: string;
        indX2: number;
        indY2: number;
        dir2: string;
    };
    function KDTEGetInaccessible(): InaccessibleEntry[];
    function KDObjFromMapArray(array: any): any;
    function KDReloadAllEditorTiles(): void;
    function KDTE_GetField(field: any): any;
    let KD_GENWEIGHTCUTOFF: number;
    function KDAddLabel(label: KDLabel): void;
    function KDMapTilesPopulate(_w: number, _h: number, indices: Record<string, string>, data: any, requiredAccess: Record<string, boolean>, maxTagFlags: Record<string, number>, tagModifiers: Record<string, number>): Record<string, KDMapTile>;
    function KDGetTileWeight(mapTile: KDMapTile, tags: Record<string, boolean>, tagCounts: Record<string, number>, tagModifiers: Record<string, number>): number;
    function KD_GetMapTile(index: string, indX: number, indY: number, tilesFilled: Record<string, KDMapTile>, indexFilled: Record<string, string>, tagCounts: Record<string, number>, requiredAccess: Record<string, boolean>, globalTags: Record<string, boolean>, indices: Record<string, string>, tagModifiers: Record<string, number>): string;
    function KDCheckMapTileFilling(mapTile: KDMapTile, indX: number, indY: number, indices: Record<string, string>, requiredAccess: Record<string, Boolean>, indexFilled: Record<string, string>): boolean;
    function KDLooseIndexRankingSuspend(indexCheck: string, indexTile: string, w: number, h: number, xx: number, yy: number): boolean;
    function KDCheckMapTileAccess(mapTile: KDMapTile, indX: number, indY: number, indexFilled: Record<string, string>, _requiredAccess: Record<string, boolean>): boolean;
    function KD_PasteTile(tile: KDMapTile, x: number, y: number, data: any): string[];
    function KDGenMaze(startX: number, startY: number, tile: any, seed: any, _MazeBlock: {
        x: number;
        y: number;
    }[]): {
        x: number;
        y: number;
    }[];
    let KDEffectTileGen: Record<string, (x: number, y: number, tile: any, tileGenerator: any, data: any) => any>;
    let KDTileGen: {
        Rubble: (x: any, y: any, tile: any, tileGenerator: any, data: any) => any;
        RubbleNoMend: (x: any, y: any, tile: any, tileGenerator: any, data: any) => any;
        Debris: (x: any, y: any, tile: any, tileGenerator: any, data: any) => any;
        Barrel: (x: any, y: any, tile: any, tileGenerator: any, data: any) => any;
        Spawn: (x: any, y: any, tile: any, tileGenerator: any, data: any) => any;
        ForceSpawn: (x: any, y: any, tile: any, tileGenerator: any, data: any) => any;
        Prisoner: (x: any, y: any, tile: any, tileGenerator: any, data: any) => any;
        Chest: (x: any, y: any, tile: any, tileGenerator: any, data: any) => {
            NoTrap: any;
            Type: string;
            Lock: any;
            Loot: any;
            Faction: any;
            Roll: number;
            refill: any;
            origloot: any;
            Special: boolean;
            RedSpecial: any;
            lootTrap: any;
        };
        GuardedChest: (x: any, y: any, tile: any, tileGenerator: any, data: any) => {
            NoTrap: any;
            Type: string;
            Lock: any;
            Loot: any;
            Faction: string;
            refill: any;
            origloot: any;
            Roll: number;
            Special: boolean;
            RedSpecial: any;
            lootTrap: any;
        };
        ChestOrShrine: (x: any, y: any, tile: any, tileGenerator: any, data: any) => any;
        Door: (x: any, y: any, tile: any, tileGenerator: any, data: any) => {
            Type: string;
            Lock: any;
            OL: any;
            RequiredDoor: any;
            DoorSkin: any;
            PotentialDoor?: undefined;
        } | {
            PotentialDoor: boolean;
            OL: any;
            Type?: undefined;
            Lock?: undefined;
            RequiredDoor?: undefined;
            DoorSkin?: undefined;
        };
        Shrine: (x: any, y: any, tile: any, tileGenerator: any, data: any) => any;
        DollDropoff: (x: any, y: any, tile: any, tileGenerator: any, data: any) => {
            Sprite: string;
            Overlay: any;
            Type: string;
        };
        Cage: (x: any, y: any, tile: any, tileGenerator: any, data: any) => {
            Type: string;
            Furniture: string;
        };
        DisplayStand: (x: any, y: any, tile: any, tileGenerator: any, data: any) => {
            Type: string;
            Furniture: string;
        };
        JailBed: (x: any, y: any, tile: any, tileGenerator: any, data: any) => {
            Jail: boolean;
            OL: boolean;
        };
        JailPoint: (x: any, y: any, tile: any, tileGenerator: any, data: any) => {
            Jail: boolean;
            OL: boolean;
        };
        Furniture: (x: any, y: any, tile: any, tileGenerator: any, data: any) => {
            Type: string;
            Furniture: any;
        };
        Table: (x: any, y: any, tile: any, tileGenerator: any, data: any) => {
            Food: string;
            Type: string;
        };
        Trap: (x: any, y: any, tile: any, tileGenerator: any, data: any) => any;
        Charger: (x: any, y: any, tile: any, tileGenerator: any, data: any) => {
            Type: string;
            NoRemove: boolean;
            lightColor: number;
            Light: number;
        };
        Conveyor: (x: any, y: any, tile: any, tileGenerator: any, data: any) => {
            Type: string;
            DX: any;
            DY: any;
            OL: boolean;
            wireType: any;
            SwitchMode: any;
        };
        SafetyConveyor: (x: any, y: any, tile: any, tileGenerator: any, data: any) => {
            Type: string;
            DX: any;
            DY: any;
            OL: boolean;
            wireType: any;
            SwitchMode: any;
            Sfty: boolean;
        };
        DollSupply: (x: any, y: any, tile: any, tileGenerator: any, data: any) => {
            Type: string;
            index: number;
            cd: number;
            rate: any;
            count: any;
            dollType: any;
            SwitchMode: any;
            wireType: any;
        };
        DollTerminal: (x: any, y: any, tile: any, tileGenerator: any, data: any) => {
            Type: string;
            OL: boolean;
        };
        Skin: (x: any, y: any, tile: any, tileGenerator: any, data: any) => {
            Skin: any;
            Skin2: any;
        };
        SkinCode: (x: any, y: any, tile: any, tileGenerator: any, data: any) => {
            SkinCode: any;
            Skin2: any;
            Skin: any;
        };
        BondageMachine: (x: any, y: any, tile: any, tileGenerator: any, data: any) => {
            Type: string;
            OL: boolean;
            Binding: any;
        };
        EffectTile: (x: any, y: any, tile: any, tileGenerator: any, data: any) => any;
        AutoDoor: (x: any, y: any, tile: any, tileGenerator: any, data: any) => {
            wireType: any;
        };
    };
    function KDCreateTile(x: number, y: number, tileGenerator: any, data: any): any;
    function KDCreateEffectTileTile(x: number, y: number, tileGenerator: any, data: any): any;
    function KDAggregateTileTags(x: any, y: any, w: any, h: any, tilesFilled: any, globalTags: any): any;
    function KDGetCategoryIndex(x: any, y: any): {
        category: string;
        tags: string[];
    };
    function KinkyDungeonSetupCrashHandler(): void;
    function KinkyDungeonTeardownCrashHandler(): void;
    function KinkyDungeonOnUncaughtError(event: ErrorEvent): void;
    function KinkyDungeonGenerateErrorReport(event: ErrorEvent): string;
    function KinkyDungeonCrashReportStateData(): string;
    function KinkyDungeonCrashReportErrorDetails(event: ErrorEvent): string;
    function KinkyDungeonCrashReportSaveData(): string;
    function KinkyDungeonCrashReportDiagnostics(): string;
    function KinkyDungeonCrashReportDeviceDetails(): string;
    function KinkyDungeonStackSanitize(stack: string): string;
    function KinkyDungeonShowCrashReportModal(report: string): void;
    function KinkyDungeonErrorImage(src: string): HTMLImageElement;
    function KinkyDungeonErrorPreamble(content: string[]): HTMLParagraphElement;
    function KinkyDungeonErrorModalButton(text: string): HTMLButtonElement;
    function KinkyDungeonErrorCopy(report: string, reportElement: HTMLElement): Promise<boolean>;
    let KDENABLEDISCORDSYNC: boolean;
    let KDGenMapCallback: () => string;
    let KDModsAfterGameStart: () => void;
    let KDModsAfterLoad: () => void;
    let KDFastWaitTime: number;
    let KDVeryFastWaitTime: number;
    let KDNormalWaitTime: number;
    let KDSlowWaitTime: number;
    let saveSlotsPerPage: number;
    let maxSaveSlotPages: number;
    let currentSavePage: number;
    let KDFullscreen: boolean;
    let KDExitButton: boolean;
    let KDPaletteWidth: number;
    let KDDefaultPalette: string;
    let KDCULLTIME: number;
    let KDLoadingFinishedSet: boolean;
    let KDStandardRenderException: {
        Consent: any[];
        Intro: any[];
        Logo: any[];
        Game: string[];
        Stats: any[];
        TileEditor: any[];
        Wardrobe: any[];
        GenMap: any[];
    };
    let KDStateBG: {
        GenMap: string;
    };
    let KDClipboardDisabled: boolean;
    let CanvasWidth: number;
    let CanvasHeight: number;
    let KDStartTime: number;
    let KDEasterEgg: boolean;
    let KDBigLanguages: string[];
    let KDBigLanguages2: string[];
    let KDLanguages: string[];
    let KinkyDungeonPlayerNeedsRefresh: boolean;
    let KinkyDungeonNextRefreshCheck: number;
    const pp: URLSearchParams;
    let param_branch: string;
    let param_test: string;
    let param_localhost: string;
    let TestMode: string | boolean;
    let KDDebugMode: boolean;
    let KDDebug: boolean;
    let KDDebugPerks: boolean;
    let KDDebugGold: boolean;
    let KDDebugLink: boolean;
    let KDAllModFiles: any[];
    let KDModFiles: {};
    let VersionMajor: number;
    let VersionMinor: number;
    let VersionPatch: number;
    let KinkyDungeonPerksConfig: string;
    let KinkyDungeonSpellsConfig: string;
    let KDUnlockedPerks: any[];
    let KinkyDungeonBackground: string;
    let KinkyDungeonPlayer: Character;
    let KDSpeakerNPC: any;
    let KinkyDungeonState: string;
    let KDIntroProgress: number[];
    let KDIntroStage: number;
    let KinkyDungeonRep: number;
    function KDSetDefaultKeybindings(): void;
    let KinkyDungeonKeybindings: any;
    let KinkyDungeonKeybindingsTemp: any;
    let KinkyDungeonKeybindingCurrentKey: string;
    let KinkyDungeonKeybindingCurrentKeyRelease: string;
    let KinkyDungeonNewGame: number;
    let KinkyDungeonGameRunning: boolean;
    let KDLose: boolean;
    let KDLoadingFinished: boolean;
    let KDLoadingDone: number;
    let KDLoadingMax: number;
    let KinkyDungeonKey: string[];
    let KinkyDungeonKeySpell: string[];
    let KinkyDungeonKeyTab: string[];
    let KinkyDungeonKeyWait: string[];
    let KinkyDungeonKeySkip: string[];
    let KinkyDungeonKeyEnter: string[];
    let KinkyDungeonKeySprint: string[];
    let KinkyDungeonKeyWeapon: string[];
    let KinkyDungeonKeyUpcast: string[];
    let KinkyDungeonKeyMenu: string[];
    let KinkyDungeonKeyToggle: string[];
    let KinkyDungeonKeySpellPage: string[];
    let KinkyDungeonKeySwitchWeapon: string[];
    let KinkyDungeonKeySwitchLoadout: string[];
    let KinkyDungeonKeyLogFilter: string[];
    let KinkyDungeonKeyMap: string[];
    let KDLoadingTextKeys: Record<string, string>;
    let kdSpecialModePerks: string[];
    let KDPalettePrefs: Record<string, string>;
    let KDPalettePrefsNPC: Record<string, string>;
    let KDPalettePrefsEnchanted: Record<string, string>;
    let KinkyDungeonGraphicsQuality: boolean;
    let KDToggleGroups: string[];
    let KDClothesToggles: {
        name: string;
    }[];
    let KDToggles: {
        SoundOffWhenMin: boolean;
        SpellBook: boolean;
        ShowRestraintOnHover: boolean;
        HiResModel: boolean;
        Fullscreen: boolean;
        SkipIntro: boolean;
        SkipTutorial: boolean;
        VibeSounds: boolean;
        Music: boolean;
        Sound: boolean;
        Bloom: boolean;
        StunFlash: boolean;
        ParticlesFX: boolean;
        ArousalHearts: boolean;
        VibeHearts: boolean;
        GagParticles: boolean;
        FancyWalls: boolean;
        FancyShadows: boolean;
        LightmapFilter: boolean;
        EnemyAnimations: boolean;
        RetroAnim: boolean;
        DrawArmor: boolean;
        DynamicArmor: boolean;
        HideFloatingWeapon: boolean;
        CrotchRopeOption: boolean;
        ChastityOption: boolean;
        ChastityOption2: boolean;
        ChastityBraOption: boolean;
        SimpleColorPicker: boolean;
        PaletteColorPicker: boolean;
        TransparentUI: boolean;
        Center: boolean;
        TurnCounter: boolean;
        ShowNPCStatuses: boolean;
        ShowSpellRange: boolean;
        ForceWarnings: boolean;
        EnableMinimap: boolean;
        BuffSide: boolean;
        ShowPath: boolean;
        ShowFacing: boolean;
        ShowSameCatSpells: boolean;
        PlayerAura: boolean;
        EnemyAura: boolean;
        OutlineAura: boolean;
        GreyscaleBlindness: boolean;
        NearestNeighbor: boolean;
        LazyWalk: boolean;
        ShiftLatch: boolean;
        Nipples: boolean;
        NippleToysOption: boolean;
        NippleToysHide: boolean;
        NipplePiercingsHide: boolean;
        FlipStatusBars: boolean;
        ForcePalette: boolean;
        RestraintPalette: boolean;
        AutoLoadMods: boolean;
        FlipPlayer: boolean;
        FlipPlayerAuto: boolean;
        Helper: boolean;
        FastFloaters: boolean;
        NoDmgFloaters: boolean;
        NoForceGreet: boolean;
        StruggleBars: boolean;
        ShowJailedNPCSprites: boolean;
        ShowZoom: boolean;
        Backgrounds: boolean;
        RawDP: boolean;
        OnlySelfQuickInv: boolean;
        OverrideOutfit: boolean;
        SaveOutfit: boolean;
        ModCompat: boolean;
        ApplyPaletteRestraint: boolean;
        ApplyPaletteTransform: boolean;
        NoOutfitPalette: boolean;
        IgnoreApplyCharPalette: boolean;
        AlwaysApplyCharPalette: boolean;
        DefaultApplyCharPalette: boolean;
        Autoloot: boolean;
        OScreenFilter: boolean;
        DistractScreenFilter: boolean;
        MMLabels: boolean;
        HideArmorWardrobe: boolean;
        BindPercent: boolean;
        AutoWaitDelayed: boolean;
        FastMovePassable: boolean;
        FastMoveDoors: boolean;
        ExtraTooltipHeight: boolean;
        ExtraTooltipCycle: boolean;
        ShowExtraStruggle: boolean;
        InvLimit: boolean;
        Headpats: boolean;
        ExtraBuffRow: boolean;
        StruggleContext: boolean;
    };
    let KDToggleCategories: {
        StruggleContext: string;
        Headpats: string;
        ExtraBuffRow: string;
        ShowExtraStruggle: string;
        ExtraTooltipHeight: string;
        ExtraTooltipCycle: string;
        FastMovePassable: string;
        FastMoveDoors: string;
        MMLabels: string;
        RawDP: string;
        Backgrounds: string;
        ShowZoom: string;
        ShowJailedNPCSprites: string;
        StruggleBars: string;
        SpellBook: string;
        FastFloaters: string;
        NoDmgFloaters: string;
        RetroAnim: string;
        HiResModel: string;
        HighResDisplacement: string;
        OptRender: string;
        Bloom: string;
        StunFlash: string;
        ParticlesFX: string;
        ArousalHearts: string;
        VibeHearts: string;
        GagParticles: string;
        FancyWalls: string;
        FancyShadows: string;
        LightmapFilter: string;
        EnemyAnimations: string;
        DrawArmor: string;
        CrotchRopeOption: string;
        ChastityOption: string;
        ChastityOption2: string;
        ChastityBraOption: string;
        SimpleColorPicker: string;
        Nipples: string;
        NippleToysOption: string;
        NippleToysHide: string;
        NipplePiercingsHide: string;
        TransparentUI: string;
        Center: string;
        TurnCounter: string;
        ShowNPCStatuses: string;
        ShowSpellRange: string;
        ForceWarnings: string;
        EnableMinimap: string;
        NoForceGreet: string;
        BuffSide: string;
        ShowPath: string;
        ShowFacing: string;
        ShowSameCatSpells: string;
        PlayerAura: string;
        EnemyAura: string;
        OutlineAura: string;
        NearestNeighbor: string;
        Helper: string;
        FlipStatusBars: string;
        ShowRestraintOnHover: string;
        ForcePalette: string;
        RestraintPalette: string;
        FlipPlayer: string;
        FlipPlayerAuto: string;
        GreyscaleBlindness: string;
        DynamicArmor: string;
        OnlySelfQuickInv: string;
        HideFloatingWeapon: string;
        ApplyPaletteRestraint: string;
        ApplyPaletteTransform: string;
        NoOutfitPalette: string;
        PaletteColorPicker: string;
        IgnoreApplyCharPalette: string;
        AlwaysApplyCharPalette: string;
        DefaultApplyCharPalette: string;
        Autoloot: string;
        HideArmorWardrobe: string;
        BindPercent: string;
        AutoWaitDelayed: string;
    };
    let KDDefaultKB: {
        Down: string;
        DownLeft: string;
        DownRight: string;
        Left: string;
        Right: string;
        Up: string;
        UpLeft: string;
        UpRight: string;
        SpellWeapon: string;
        Spell1: string;
        Spell2: string;
        Spell3: string;
        Spell4: string;
        Spell5: string;
        Spell6: string;
        Spell7: string;
        Spell8: string;
        Spell9: string;
        Spell0: string;
        Tab1: string;
        Tab2: string;
        Tab3: string;
        Tab4: string;
        Tab5: string;
        Wait: string;
        WaitInterrupt: string;
        ToggleBuff: string;
        Skip: string;
        Enter: string;
        Pass: string;
        Door: string;
        Sprint: string;
        MakeNoise: string;
        PlaySelf: string;
        Crouch: string;
        Upcast: string;
        UpcastCancel: string;
        SpellPage: string;
        QInventory: string;
        Inventory: string;
        Magic: string;
        Log: string;
        Restart: string;
        SwitchWeapon: string;
        SwitchWeaponOffhand: string;
        SwitchWeaponOffhandPrevious: string;
        SwitchWeaponOffhandPrevious2: string;
        SwitchLoadout1: string;
        SwitchLoadout2: string;
        SwitchLoadout3: string;
        AStruggle: string;
        APathfind: string;
        AInspect: string;
        BulletTransparency: string;
        Map: string;
        MsgLog: string;
        ZoomOut: string;
        ZoomIn: string;
    };
    let KDZoomIndex: number;
    let KDZoomLevels: number[];
    let KinkyDungeonRootDirectory: string;
    let KinkyDungeonGameData: any;
    let KinkyDungeonGameDataNullTimer: number;
    let KinkyDungeonGameDataNullTimerTime: number;
    let KinkyDungeonStreamingPlayers: any[];
    let KinkyDungeonInitTime: number;
    let KinkyDungeonSleepTime: number;
    let KinkyDungeonFreezeTime: number;
    let KinkyDungeonStunTime: number;
    let KinkyDungeonPlaySelfTime: number;
    let KinkyDungeonOrgasmTime: number;
    let KinkyDungeonAutoWait: boolean;
    let KinkyDungeonAutoWaitStruggle: boolean;
    let KinkyDungeonConfigAppearance: boolean;
    const Consumable = "consumable";
    const Restraint = "restraint";
    const LooseRestraint = "looserestraint";
    const Outfit = "outfit";
    const Accessory = "accessory";
    const Weapon = "weapon";
    const Misc = "misc";
    const Armor = "armor";
    let KinkyDungeonStatsChoice: Map<any, any>;
    let KDJourney: string;
    let KDOptOut: boolean;
    let KDDefaultMaxParty: number;
    let KDDefaultJourney: string[];
    let KDDefaultAlt: string[];
    interface KDGameDataBase {
        PlayerWeaponLastEquipped: string;
        SawFlags: Record<string, Record<string, number>>;
        PersistentItems: Record<string, Record<string, number>>;
        JourneyProgression: string[];
        AttachedWep: string;
        InventoryAction: string;
        InventoryActionContainer: string[];
        InventoryActionManaCost: number;
        SellMarkup: number;
        CurseLevel: number;
        UsingConsumable: string;
        BondageTarget: number;
        FoodTarget: number;
        KeysNeeded: boolean;
        JailRemoveRestraintsTimer: number;
        KinkyDungeonSpawnJailers: number;
        KinkyDungeonSpawnJailersMax: number;
        KinkyDungeonLeashedPlayer: number;
        KinkyDungeonLeashingEnemy: number;
        JailGuard: number;
        GuardTimer: number;
        GuardTimerMax: number;
        GuardSpawnTimer: number;
        GuardSpawnTimerMax: number;
        GuardSpawnTimerMin: number;
        KinkyDungeonMaxPrisonReduction: number;
        KinkyDungeonPrisonReduction: number;
        KinkyDungeonPrisonExtraGhostRep: number;
        PrisonGoodBehaviorFromLeash: number;
        KinkyDungeonJailTourTimer: number;
        KinkyDungeonJailTourTimerMin: number;
        KinkyDungeonJailTourTimerMax: number;
        KinkyDungeonPenanceCostCurrent: number;
        KinkyDungeonAngel: number;
        KDPenanceStage: number;
        SpawnedPartyPrisoners: Record<string, number>;
        KDPenanceStageEnd: number;
        AngelCurrentRep: string;
        KDPenanceMode: string;
        OrgasmStage: number;
        OrgasmTurns: number;
        OrgasmStamina: number;
        SleepTurns: number;
        SlowMoveTurns: number;
        PlaySelfTurns: number;
        RescueFlag: boolean;
        KinkyDungeonPenance: boolean;
        GuardApplyTime: number;
        WarningLevel: number;
        AncientEnergyLevel: number;
        OrigEnergyLevel: number;
        LastMP: number;
        LastAP: number;
        LastSP: number;
        LastWP: number;
        Outfit: string;
        Champion: string;
        ChampionCurrent: number;
        LastMapSeed: string;
        AlreadyOpened: {
            x: number;
            y: number;
        }[];
        Journey: string;
        CheckpointIndices: number[];
        PrisonerState: string;
        TimesJailed: number;
        JailTurns: number;
        JailKey: boolean;
        CurrentDialog: string;
        CurrentDialogStage: string;
        OrgasmNextStageTimer: number;
        DistractionCooldown: number;
        ConfirmAttack: boolean;
        CurrentDialogMsg: string;
        MasterworkIntro: boolean;
        CurrentDialogMsgSpeaker: string;
        CurrentDialogMsgPersonality: string;
        CurrentDialogMsgID: number;
        CurrentDialogEntity: entity;
        CurrentDialogMsgData: Record<string, string>;
        CurrentDialogMsgValue: Record<string, number>;
        AlertTimer: number;
        HeartTaken: boolean;
        CurrentVibration: KinkyVibration;
        Edged: boolean;
        TimeSinceLastVibeStart: Record<string, number>;
        TimeSinceLastVibeEnd: Record<string, number>;
        OfferFatigue: number;
        Favors: Record<string, number>;
        RoomType: string;
        MapMod: string;
        HunterTimer: number;
        Hunters: number[];
        Quests: string[];
        QuestData: Record<string, any>;
        RevealedTiles: Record<string, number>;
        RevealedFog: Record<string, number>;
        PriorJailbreaks: number;
        PriorJailbreaksDecay: number;
        PreviousWeapon: string[];
        PreviousWeaponLock: boolean[];
        StaminaPause: number;
        StaminaSlow: number;
        ManaSlow: number;
        TempFlagFloorTicks: Record<string, number>;
        KneelTurns: number;
        AllowedSpellPages: Record<string, string[]>;
        KeyringLocations: {
            x: number;
            y: number;
        }[];
        HiddenItems: Record<string, boolean>;
        ItemPriority: Record<string, number>;
        CagedTime: number;
        DelayedActions: KDDelayedAction[];
        OfferCount: number;
        ItemID: number;
        Offhand: string;
        OffhandOld: string;
        OffhandReturn: string;
        ShopkeeperFee: number;
        DollCount: number;
        ChestsGenerated: string[];
        DollRoomCount: number;
        CollectedHearts: number;
        CollectedOrbs: number;
        otherPlaying: number;
        Training: Record<string, KDTrainingRecord>;
        QuickLoadout: KDPresetLoadout[];
        CurrentLoadout: number;
        HighestLevelCurrent: number;
        HighestLevel: number;
        KDChasingEnemies: entity[];
        ShopRewardProgram: number;
        ShopRewardProgramThreshold: number;
        ShopkeepersMurdered: number;
        tickAlertTimer: boolean;
        HostileFactions: string[];
        MovePoints: number;
        Wait: number;
        Class: string;
        Party: entity[];
        CapturedParty: entity[];
        PlayerName: string;
        QuickLoadout_Weapon: boolean;
        QuickLoadout_Merge: boolean;
        ItemsSold: Record<string, number>;
        MaxParty: number;
        Crouch: boolean;
        FocusControlToggle: Record<string, boolean>;
        FloorRobotType: Record<string, string>;
        EpicenterLevel: number;
        BlockTokens: number;
        DodgeTokens: number;
        ShieldTokens: number;
        BlockTokensMax: number;
        DodgeTokensMax: number;
        ShieldTokensMax: number;
        Shield: number;
        ShieldDamage: number;
        Balance: number;
        BalancePause: boolean;
        NPCRestraints: Record<string, Record<string, NPCRestraint>>;
        Collection: Record<string, KDCollectionEntry>;
        CollectionSorted: KDCollectionEntry[];
        HeelPowerEffective: number;
        HeelPower: number;
        visionAdjust: number;
        visionAdjustBlind: number;
        visionBlind: number;
        CollectionGuests: number;
        SelectedEscapeMethod: string;
        Restriction: number;
        JourneyX: number;
        JourneyY: number;
        ShortcutIndex: string;
        JourneyMap: KDJourneyMap;
        JourneyTarget: {
            x: number;
            y: number;
        };
        LastDragon: string;
        ElevatorsUnlocked: Record<number, string | boolean>;
        TeleportLocations: Record<string, {
            x: number;
            y: number;
            portalpos_x: number;
            portalpos_y: number;
            type: string;
            checkpoint: string;
            level: number;
        }>;
        MaxVisionDist: number;
        MinVisionDist: number;
        NightVision: number;
        LockoutChance: number;
        StatMaxBonus: Record<string, number>;
        LogFilters: Record<string, boolean>;
        NoForceGreet: boolean;
        InteractTargetX: number;
        InteractTargetY: number;
        RegimentID: number;
        Containers: Record<string, KDContainer>;
        FacilitiesData: FacilitiesData;
        Regiments: Record<string, KDRegiment>;
        QuickLoadouts: Record<string, string[]>;
        PersistentNPCCache: Record<string, number[]>;
        NamesGenerated: Record<string, number>;
        Guilt: number;
        LastSave: number;
        SigilsErased: number;
        SealErasedQuota: number;
        DragonCaptured?: boolean;
        DragonTarget?: number;
        IdentifiedObj?: Record<string, number>;
        MaidKnightFloor: number;
        UseJourneyTarget?: boolean;
        AutoRelease: {
            NonNotable: boolean;
            Escaped: boolean;
        };
        WarningTiles: Record<string, WarningTileRecord[]>;
        RecruitedFaction?: string;
        currentTitleAuto: string;
        currentTitle: string;
        oldtitles: string[];
        titlesUnlocked: string[];
        titledata: KDPlayerTitleData;
    }
    let KDGameDataBase: KDGameDataBase;
    let KDGameData: KDGameDataBase;
    function KinkyDungeonLeashingEnemy(): entity;
    let KDJailGuard: any;
    function KinkyDungeonJailGuard(): entity;
    let KDAngel: any;
    function KinkyDungeonAngel(): any;
    function KDUnlockPerk(Perk?: string): void;
    function KDLoadPerks(): void;
    let KDBGColor: string;
    function KDMapInit(list: any): Record<any, any>;
    function KDistEuclidean(x: number, y: number): number;
    function KDistEuclideanSquared(x: number, y: number): number;
    function KDistChebyshev(x: number, y: number): number;
    function KDistEuclideanApprox(dx: number, dy: number): number;
    function KDistTaxicab(x: number, y: number): number;
    function KDLoadToggles(): void;
    function KDSaveToggles(): void;
    function KDMigrateSaveToNewSystem(): Promise<void>;
    function KinkyDungeonLoad(): void;
    function KinkyDungeonDeviousDungeonAvailable(): boolean;
    function KinkyDungeonIsPlayer(): boolean;
    let KinkyDungeonCreditsPos: number;
    let KDMaxPatronPerPage: number;
    let KDMaxPatron: number;
    let KinkyDungeonPatronPos: number;
    let KinkyDungeonFastWait: boolean;
    let KinkyDungeonTempWait: boolean;
    let KinkyDungeonSexyMode: boolean;
    let KinkyDungeonClassMode: string;
    let KinkyDungeonRandomMode: boolean;
    let KinkyDungeonProgressionMode: string;
    let KinkyDungeonItemMode: number;
    let KinkyDungeonEasyMode: number;
    let KinkyDungeonSaveMode: boolean;
    let KinkyDungeonHardMode: boolean;
    let KinkyDungeonExtremeMode: boolean;
    let KinkyDungeonPerksMode: number;
    let KinkyDungeonPerkProgressionMode: number;
    let KinkyDungeonPerkBondageMode: number;
    let KinkyDungeonPerkBondageVisMode: number;
    let KinkyDungeonSexyPiercing: boolean;
    let KinkyDungeonSexyPlug: boolean;
    let KinkyDungeonSexyPlugFront: boolean;
    let KDOldValue: string;
    let KDOldSaveCodeValue: string;
    let KDOriginalValue: string;
    let KDResetOutfitToggleFlag: boolean;
    let KDRestart: boolean;
    let fpscounter: number;
    let lastfps: number;
    let dispfps: number;
    function sleep(msec: number): Promise<unknown>;
    let KDMarkAsCache: any[];
    let lastGlobalRefresh: number;
    let GlobalRefreshInterval: number;
    let KDGlobalRefresh: boolean;
    let KDGlobalFilterCacheRefresh: boolean;
    let KDLogoStartTime: number;
    let KDLogoEndTime: number;
    let KDLogoEndTime2: number;
    function KDOpenFullscreen(): void;
    function KDCloseFullscreen(): void;
    let saveError: boolean;
    let KDErrorText: string;
    let KDErrorTextTime: number;
    let KDErrorTextTime_DELAY: number;
    let KDCurrentHoverButton: KDButtonParamData;
    let KDLastScrollableListUpdate: number;
    let mouseHoldTaken: string;
    function KinkyDungeonRun(): boolean;
    let KDLastActiveElement: any;
    let KDDrawDelta: number;
    let kdTrackGameBoard: boolean;
    let kdTrackGameFog: boolean;
    let kdTrackGameParticles: boolean;
    let KDlastCull: Map<any, any>;
    function KDGetCullTime(): number;
    function KDPurgeFilterSprites(): void;
    function KDPurgeSpriteRelatedFilters(sprite: PIXISprite | PIXITexture): void;
    function KDCullSprites(): void;
    function KDCullSpritesList(list: Map<string, any>): void;
    function KDCullRTList(list: Map<string, PIXIRenderTexture>): void;
    function KDCullTexList(list: Map<string, PIXITexture>): void;
    interface KDButtonPressData {
        source: string;
    }
    interface KDButtonParamData {
        Left: number;
        Top: number;
        Width: number;
        Height: number;
        enabled: boolean;
        func?: (bdata: KDButtonPressData) => boolean;
        priority: number;
        scrollfunc?: (amount: number) => void;
        hotkeyPress?: string;
        contextMenu?: string;
    }
    let KDButtonsCache: Record<string, KDButtonParamData>;
    let KDHoldButtonsCache: Record<string, KDButtonParamData>;
    let KDLastButtonsCache: Record<string, KDButtonParamData>;
    let KDLastHoldButtonsCache: Record<string, KDButtonParamData>;
    function DrawButtonKD(name: string, enabled: boolean, Left: number, Top: number, Width: number, Height: number, Label: string, Color: string, Image?: string, HoveringText?: string, Disabled?: boolean, NoBorder?: boolean): void;
    function DrawHoldButtonKDExTo(Container: PIXIContainer, name: string, func: (bdata: any) => any, enabled: boolean, Left: number, Top: number, Width: number, Height: number, Label: string, Color: string, Image?: string, HoveringText?: string, Disabled?: boolean, NoBorder?: boolean, FillColor?: string, FontSize?: number, ShiftText?: boolean, options?: any): boolean;
    function DrawButtonKDEx(name: string, func: (bdata: any) => any, enabled: boolean, Left: number, Top: number, Width: number, Height: number, Label: string, Color: string, Image?: string, HoveringText?: string, Disabled?: boolean, NoBorder?: boolean, FillColor?: string, FontSize?: number, ShiftText?: boolean, options?: any): boolean;
    function DrawButtonKDExContext(name: string, contextMenu: string, func: (bdata: any) => any, enabled: boolean, Left: number, Top: number, Width: number, Height: number, Label: string, Color: string, Image?: string, HoveringText?: string, Disabled?: boolean, NoBorder?: boolean, FillColor?: string, FontSize?: number, ShiftText?: boolean, options?: any): boolean;
    function DrawButtonKDExScroll(name: string, scrollfunc: (amount: number) => boolean | void, func: (bdata: any) => boolean, enabled: boolean, Left: number, Top: number, Width: number, Height: number, Label: string, Color: string, Image?: string, HoveringText?: string, Disabled?: boolean, NoBorder?: boolean, FillColor?: string, FontSize?: number, ShiftText?: boolean, options?: any): boolean;
    function DrawButtonKDExTo(Container: any, name: string, func: (bdata: any) => boolean, enabled: boolean, Left: number, Top: number, Width: number, Height: number, Label: string, Color: string, Image?: string, HoveringText?: string, Disabled?: boolean, NoBorder?: boolean, FillColor?: string, FontSize?: number, ShiftText?: boolean, options?: any): boolean;
    function KDMouseWheel(event: WheelEvent): void;
    function KDFunctionCycleTabScroll(amount: number): boolean;
    function KDFunctionOptionsScroll(amount: number): boolean;
    function KDFunctionPerksScroll(amount: number): boolean;
    function KDFunctionQuestScroll(amount: number): boolean;
    function KDFunctionCollectionScroll(amount: number): boolean;
    function KDFunctionFacilitiesScroll(amount: number): boolean;
    function KDFunctionContainerScroll(amount: number): boolean;
    function KDFunctionJourneyMapScroll(amount: number): boolean;
    function KDFunctionSpellPageScroll(amount: number): boolean;
    function KDFunctionMagicPageScroll(amount: number): boolean;
    function KDFunctionMagicSpellPageScroll(amount: number): boolean;
    function KDFunctionInventoryScroll(amount: number): boolean;
    function KDFunctionMsgScroll(amount: number): boolean;
    function KDFunctionRestraintIndexScroll(amount: number): boolean;
    function KDFunctionDialogueScroll(amount: number): boolean;
    function KDFunctionShopScroll(amount: number): boolean;
    function KDProcessButtonScroll(amount: number, padV?: number): boolean;
    function KDProcessButtons(): any;
    function KDProcessHoldButtons(): any;
    function KDClickButton(name: string, source?: string, key?: string): boolean;
    function KDHoldButton(name: string, source?: string, key?: string): boolean;
    function MouseInKD(name: string, padX?: number, padV?: number): boolean;
    function KinkyDungeonGetTraitsCount(): number;
    function KDSendTrait(_trait: any): void;
    function KDSendSpell(_spell: any): void;
    function KDSendSpellCast(_spell: any): void;
    function KDSendWeapon(_weapon: any): void;
    function KDSendStatus(_type: any, _data?: any, _data2?: any): void;
    function KDSendEvent(_type: any): void;
    function KinkyDungeonLoadStats(): void;
    let KinkyDungeonGameFlag: boolean;
    function KDInitializeJourney(Journey: string, Level?: number): void;
    function KDCommitKeybindings(): void;
    let afterLoaded: boolean;
    let KDGameSaveDBStoreName: string;
    function KinkyDungeonDBOpen(): Promise<IDBDatabase>;
    function KinkyDungeonDBSave(saveslot: number, gamecode?: string): void;
    function KinkyDungeonDBLoad(saveslot: number): Promise<string | null>;
    function KinkyDungeonDBDelete(saveslot: number): Promise<unknown>;
    let LoadMenuCurrentSave: string;
    let LoadMenuCurrentSlot: number;
    let loadedsaveslots: string[];
    let loadedcloudsaveslots: string[];
    let loadedsaveNames: string[];
    let loadedSaveforPreview: KinkyDungeonSave;
    let KDPreviewModel: any;
    let KDSaveSlot: number;
    let ModelPreviewLoaded: boolean;
    let KDDeleteSaveIndex: number;
    let KDUploadSaveIndex: any;
    let KDLoadCloudGames: boolean;
    let KDSlot0: string;
    let KDCloudLogintype: any;
    let KDCloudLogintoken: any;
    let KDCloudLoginiv: any;
    let KDDiscordLoginname: any;
    let KDDiscordLoginpfp: any;
    function KDDrawLoadMenu(): void;
    function KDUpdateDiscordName(): void;
    function KDLoginDiscord(): void;
    function KDLogoutDiscord(): void;
    function KDSaveGameToCloud(saveslot: any): void;
    function KDSyncCloudSaveGame(): void;
    function KinkyDungeonDressModelPreview(): Promise<unknown>;
    function KinkyDungeonLoadPreview(String: string): KinkyDungeonSave;
    function KinkyDungeonStartNewGame(Load?: boolean): void;
    function KDUpdatePlugSettings(evalHardMode: boolean): void;
    function KDUpdateHardMode(): void;
    let KDHardModeThresh: number;
    let KDAwaitingModLoad: boolean;
    function KDHandleMouseDown(): boolean;
    function KinkyDungeonHandleClick(event: MouseEvent): boolean;
    function KinkyDungeonClick(): void;
    function KDClick(event: MouseEvent): boolean;
    function KinkyDungeonExit(): void;
    function KinkyDungeonKeyDown(): void;
    let mouseDown: boolean;
    let MouseClicked: boolean;
    let LastHoldTime: number;
    let LongHoldThresh: number;
    let LongHoldPinged: boolean;
    let HoldStartTime: number;
    let HoldStartPosX: number;
    let HoldStartPosY: number;
    let HoldEndPosX: number;
    let HoldEndPosY: number;
    let HoldMoved: boolean;
    let HoldMoveThresh: number;
    let KinkyDungeonGameKey: any;
    function KinkyDungeonGenerateSaveData(): KinkyDungeonSave;
    let KDSaveQueue: KinkyDungeonSave[];
    let KDSaveBusy: boolean;
    function KinkyDungeonSaveGame(ToString?: boolean): KinkyDungeonSave;
    let KDSaveTimeout: number;
    function KinkyDungeonCompressSave(save: string): Promise<string>;
    function KinkyDungeonLoadGame(String?: string): boolean;
    let KinkyDungeonSeed: string;
    let KDRandom: () => number;
    function KDrandomizeSeed(Native: boolean): void;
    function KDsetSeed(str: string): void;
    function xmur3(str: string): () => number;
    function sfc32(a: number, b: number, c: number, d: number): () => number;
    let kdSoundCache: Map<string, HTMLAudioElement>;
    function GetNewAudio(): any;
    function AudioPlayInstantSoundKD(Path: string, volume?: number): boolean;
    function hashCode(s: string): number;
    function TextGetKD(Text: string): string;
    function KinkyDungeonCheckPlayerRefresh(): void;
    function CJKcheck(text: string, p?: number, o?: string): RegExpMatchArray | boolean;
    function KinkyDungeonGetCanvas(id: string): HTMLCanvasElement;
    function KDDrawGameSetupTabs(_xOffset?: number): void;
    function DecompressB64(str: string): string;
    let KDToggleTab: string;
    function KDDrawToggleTabs(xOffset: number): void;
    function KinkyDungeonMultiplayerUpdate(_delay: any): void;
    let saveFile: any;
    let KDSAVEEXTENSION: string;
    let KDOUTFITEXTENSION: string;
    let KDOUTFITBACKUP: string;
    let KDSaveName: string;
    function KDLoadSave(files: any): void;
    function downloadFile(filename: string, text: string): void;
    function KDChangeZoom(change: number): void;
    let KDMinimized: boolean;
    let KDFocusSounds: number;
    function KDSoundEnabled(): boolean;
    function RunGenMapCallback(): Promise<void>;
    function KDReloadChallenge(): void;
    let KDCustomToggleTab: {};
    let KDBaseDelayWaitTime: number;
    function KDDelayWaitTime(): number;
    function KDRefreshSleep(): void;
    let KDCustomOptionsSize: {
        UI: number;
        ClothesToggles: number;
    };
    let KDCustomOptionsSpacing: {
        UI: number;
        ClothesToggles: number;
    };
    function KDGetWindowCanvasOffset(): {
        x: number;
        y: number;
        width: number;
        height: number;
        widthscale: number;
        heightscale: number;
        canvaswidth: number;
        canvasheight: number;
    };
    let KDRender: {
        JourneyMap: () => void;
    };
    let KDCustomDrawState: {
        JourneyMap: (xOffset: any) => void;
    };
    function KinkyDungeonCreateMap(MapParams: floorParams, RoomType: string, MapMod: string, Floor: number, testPlacement?: boolean, seed?: boolean, forceFaction?: string, worldLocation?: {
        x: number;
        y: number;
    }, useExisting?: boolean, origMapType?: string, direction?: number, forceEscape?: string): void;
    let KDStageBossGenerated: boolean;
    function KinkyDungeonGenNavMap(fromPoint?: {
        x: number;
        y: number;
    }): void;
    function KDLowPriorityNavMesh(): void;
    type GridEntry = {
        [_: string]: {
            x: number;
            y: number;
        };
    };
    function KinkyDungeonGetAccessible(startX: number, startY: number, testX?: number, testY?: number): GridEntry;
    function KinkyDungeonGetAccessibleRoom(startX: number, startY: number): string[];
    function KinkyDungeonIsAccessible(testX: number, testY: number): boolean;
    function KinkyDungeonIsReachable(testX: number, testY: number, testLockX: number, testLockY: number): boolean;
    function KinkyDungeonGetAllies(): entity[];
    function KDIsImprisoned(enemy: entity): boolean;
    function KDCanBringAlly(e: entity): boolean;
    function KDChooseFactions(factionList: string[], Floor: number, Tags: string[], BonusTags: Record<string, {
        bonus: number;
        mult: number;
    }>, Set: boolean): string[];
    type SpawnBox = {
        requiredTags: string[];
        tags: string[];
        currentCount: number;
        maxCount: number;
        filterTags?: string[];
        ignoreAllyCount?: boolean;
        bias?: number;
    };
    function KinkyDungeonPlaceEnemies(spawnPoints: any[], InJail: boolean, Tags: string[], BonusTags: any, Floor: number, width: number, height: number, altRoom?: any, randomFactions?: any[], factionEnemy?: any): void;
    function KinkyDungeonGetClosestSpecialAreaDist(x: number, y: number): number;
    function KinkyDungeonCreateRectangle(Left: number, Top: number, Width: number, Height: number, Border?: boolean, Fill?: boolean, Padding?: number | boolean, OL?: boolean, NW?: boolean, flexCorner?: boolean, Jail?: boolean): void;
    function KinkyDungeonPlaceStairs(_startpos: number, width: number, height: number, noStairs: boolean, nostartstairs: boolean, origMapType: string): void;
    function KinkyDungeonSkinArea(skin: any, X: number, Y: number, Radius: number, NoStairs?: boolean): void;
    let KDMinBoringness: number;
    function KinkyDungeonPlaceChests(params: floorParams, chestlist: any[], spawnPoints: any[], shrinelist: any[], treasurechance: number, treasurecount: number, rubblechance: number, Floor: number, width: number, height: number): void;
    function KinkyDungeonPlaceLore(width: number, height: number): number;
    function KinkyDungeonPlaceHeart(width: number, height: number, _Floor: number): boolean;
    function KinkyDungeonPlaceShrines(chestlist: any[], shrinelist: any[], shrinechance: number, shrineTypes: any[], shrinecount: number, shrinefilter: string[], _ghostchance: number, manaChance: number, orbcount: number, filterTypes: string[], Floor: number, width: number, height: number, allowQuests: boolean, allowHearts: boolean): number;
    function KinkyDungeonPlaceChargers(chargerlist: any[], chargerchance: number, litchargerchance: number, chargercount: number, _Floor: number, width: number, height: number): void;
    let KinkyDungeonCommercePlaced: number;
    function KDGetMapParams(): floorParams;
    function KinkyDungeonGenerateShrine(_Floor: number, filterTypes: string[], manaChance: number): {
        type: any;
        drunk: boolean;
    } | {
        type: string;
        drunk?: undefined;
    };
    function KinkyDungeonPlaceSpecialTiles(gaschance: number, gasType: string, _Floor: number, width: number, height: number): void;
    function KinkyDungeonPlaceBrickwork(brickchance: number, _Floor: number, width: number, height: number): void;
    function KinkyDungeonPlaceTraps(traps: any[], traptypes: any[], trapchance: number, doorlocktrapchance: number, Floor: number, width: number, height: number): void;
    function KinkyDungeonPlacePatrols(Count: number, width: number, height: number): void;
    function KDCheckMainPath(): boolean;
    function KDPruneEntrances(width: number, height: number): void;
    let KDFocusableTextFields: string[];
    let KDSlowedSprintCost: number;
    let KDMAXGODDESSQUESTS: number;
    let KDBalanceSprintMult: number;
    let KDBalanceInertiaMult: number;
    let KDBalanceAttackMult: number;
    let KDBalanceCastArmsMult: number;
    let KDBalanceCastLegsMult: number;
    let KinkyDungeonGagMumbleChanceRestraint: number;
    let KinkyDungeonGagMumbleChance: number;
    let KinkyDungeonGagMumbleChancePerRestraint: number;
    let MiniGameKinkyDungeonCheckpoint: string;
    let MiniGameKinkyDungeonLevel: number;
    let KinkyDungeonMapIndex: Record<string, string>;
    let KDWorldMap: Record<string, KDWorldSlot>;
    let KDCurrentWorldSlot: {
        x: number;
        y: number;
    };
    let KDMapData: KDMapDataType;
    let KDMapExtraData: {
        Boringness: number[];
        VisionGrid: number[];
        ColorGrid: number[];
        ShadowGrid: number[];
        BrightnessGrid: number[];
    };
    let KinkyDungeonUpdateLightGrid: boolean;
    let KinkyDungeonGrid_Last: string;
    let KinkyDungeonGridSizeDisplay: number;
    let KinkyDungeonGridWidthDisplay: number;
    let KinkyDungeonGridHeightDisplay: number;
    let KinkyDungeonMoveDirection: MoveDirection;
    let KinkyDungeonTextMessagePriority: number;
    let KinkyDungeonTextMessage: string;
    let KinkyDungeonTextMessageNoPush: boolean;
    let KinkyDungeonTextMessageTime: number;
    let KinkyDungeonTextMessageColor: string;
    let KinkyDungeonActionMessagePriority: number;
    let KinkyDungeonActionMessage: string;
    let KinkyDungeonActionMessageNoPush: boolean;
    let KinkyDungeonActionMessageTime: number;
    let KinkyDungeonActionMessageColor: string;
    let KinkyDungeonSpriteSize: number;
    let KinkyDungeonCanvas: HTMLCanvasElement;
    let KinkyDungeonContext: any;
    let KinkyDungeonCanvasFow: HTMLCanvasElement;
    let KinkyDungeonContextFow: any;
    let KinkyDungeonCanvasPlayer: HTMLCanvasElement;
    let KinkyDungeonContextPlayer: any;
    let KinkyDungeonPOI: any[];
    let KinkyDungeonStairTiles: string;
    let KDDefaultAvoidTiles: string;
    let KinkyDungeonGroundTiles: string;
    let KinkyDungeonWallTiles: string;
    let KDCrackableTiles: string;
    let KDMendableTiles: string;
    let KinkyDungeonBlockTiles: string;
    let KinkyDungeonMovableTilesEnemy: string;
    let KinkyDungeonMovableTilesSmartEnemy: string;
    let KDInteractableTiles: string;
    let KinkyDungeonMovableTiles: string;
    let KDRandomDisallowedNeighbors: string;
    let KDTrappableNeighbors: string;
    let KDTrappableNeighborsLikely: string;
    let KinkyDungeonTransparentObjects: string;
    let KinkyDungeonTransparentMovableObjects: string;
    let KDOpenDoorTiles: string[];
    let KinkyDungeonTargetTile: any;
    let KinkyDungeonTargetTileLocation: string;
    const KinkyDungeonBaseLockChance = 0.12;
    const KinkyDungeonScalingLockChance = 0.16;
    const KinkyDungeonBlueLockChance = -0.1;
    const KinkyDungeonBlueLockChanceScaling = 0.015;
    const KinkyDungeonBlueLockChanceScalingMax = 0.4;
    const KinkyDungeonGoldLockChance = -0.25;
    const KinkyDungeonGoldLockChanceScaling = 0.015;
    const KinkyDungeonGoldLockChanceScalingMax = 0.25;
    const KinkyDungeonPurpleLockChance = 0;
    const KinkyDungeonPurpleLockChanceScaling = 0.02;
    const KinkyDungeonPurpleLockChanceScalingMax = 0.6;
    let KinkyDungeonCurrentMaxEnemies: number;
    let KinkyDungeonNextDataSendTime: number;
    const KinkyDungeonNextDataSendTimeDelay = 500;
    let KinkyDungeonNextDataSendTimeDelayPing: number;
    let KinkyDungeonNextDataSendStatsTimeDelay: number;
    let KinkyDungeonNextDataSendStatsTime: number;
    let KinkyDungeonNextDataLastTimeReceived: number;
    let KinkyDungeonNextDataLastTimeReceivedTimeout: number;
    let KinkyDungeonLastMoveDirection: any;
    let KinkyDungeonTargetingSpell: spell;
    let KDAutoWaitDelayed: boolean;
    let KinkyDungeonTargetingSpellItem: any;
    let KinkyDungeonTargetingSpellWeapon: any;
    let KinkyDungeonMaxLevel: number;
    let KinkyDungeonLastMoveTimer: number;
    let KinkyDungeonLastMoveTimerStart: number;
    let KinkyDungeonLastMoveTimerCooldown: number;
    let KinkyDungeonLastMoveTimerCooldownStart: number;
    let KinkyDungeonJailLeash: number;
    let KinkyDungeonJailLeashY: number;
    let KinkyDungeonJailLeashX: number;
    let KinkyDungeonSaveInterval: number;
    let KinkyDungeonSFX: any[];
    function KDIsStairExplored(x: any, y: any): boolean;
    function KDExploreStairs(x: any, y: any): void;
    function KDDefaultMapData(mapX: number, mapY: number, RoomType?: string, MapMod?: string): KDMapDataType;
    function KinkyDungeonEffectTilesSet(location: string, value: Record<string, effectTile>): void;
    function KinkyDungeonEffectTilesGet(location: string, mapData?: KDMapDataType): Record<string, effectTile>;
    function KDSetPlayerTile(value: any): any;
    function KDGetPlayerTile(): any;
    function KinkyDungeonTilesSet(location: string, value: any): any;
    function KinkyDungeonTilesGet(location: string): any;
    function KinkyDungeonTilesDelete(location: string): void;
    function KDClearTile(location: string): void;
    function KinkyDungeonSkinSet(location: string, value: any): void;
    function KinkyDungeonSkinGet(location: string): any;
    function KinkyDungeonSkinDelete(location: string): void;
    function KDAlreadyOpened(x: number, y: number): boolean;
    function KinkyDungeonPlaySound(src: string, entity?: entity, vol?: number): void;
    function KinkyDungeonSetCheckPoint(Checkpoint?: string, _AutoSave?: any, _suppressCheckPoint?: any): void;
    function KinkyDungeonNewGamePlus(increaseDiff: boolean): void;
    function KDResetData(Data?: KDGameDataBase): void;
    function InitPersistentGen(): void;
    function KDResetEventData(Data?: any): void;
    function KinkyDungeonInitialize(Level: number, Load?: any): void;
    function KDInitCanvas(): void;
    function KDCreateBoringness(noBoring: boolean): void;
    function KDGetMapSize(): number;
    function KDGetMazeParams(params: floorParams): {
        oldest: number;
        newest: number;
        chance_STOP: number;
        opennessMult: number;
    };
    function KDGetWorldMapLocation(point: {
        x: number;
        y: number;
    }): KDWorldSlot;
    function KDCreateWorldLocation(x: number, y: number, jx: number, jy: number, _main?: string): void;
    function KDSaveRoom(slot: {
        x: number;
        y: number;
    }, saveconstantX: boolean): void;
    function KDUnPackEnemies(data: KDMapDataType): void;
    function KDSyncPersistentEntities(Level: number, data: KDMapDataType, removeMissing?: boolean): void;
    function KDUnPackEnemy(enemy: entity): boolean;
    function KDPackEnemy(enemy: entity): void;
    function KDPackEnemies(data: KDMapDataType): void;
    function KDLoadMapFromWorld(x: number, y: number, room: string, direction?: number, constantX?: boolean, ignoreAware?: boolean): boolean;
    function KDPlacePlayerBasedOnDirection(direction?: number, sideRoomIndex?: string, nomove?: boolean): void;
    function KDInitTempValues(seed?: boolean): void;
    function KDUpdateOptionGame(start: any): void;
    function KDGetEffLevel(): number;
    function KDRandomizeRedLock(): string;
    function KDGetLockList(Guaranteed?: boolean, Floor?: number, AllowGold?: boolean, Type?: string, Data?: any): Record<string, number>;
    function KinkyDungeonGenerateLock(Guaranteed?: boolean, Floor?: number, AllowGold?: boolean, Type?: string, Data?: any): string;
    let KDPlaceMode: {
        MODE_PLACENEW: number;
        MODE_MODIFYPOTENTIALANDEXISTING: number;
        MODE_MODIFYEXISTINGONLY: number;
    };
    function KinkyDungeonPlaceDoors(doorchance: number, doortrapchance: number, nodoorchance: number, doorlockchance: number, trapChance: number, grateChance: number, Floor: number, width: number, height: number, placeMode?: number): any[];
    function KinkyDungeonReplaceDoodads(Chance: number, barchance: number, wallRubblechance: number, wallhookchance: number, ceilinghookchance: number, width: number, height: number, altType?: any): void;
    function KinkyDungeonPlaceJailEntrances(width: number, height: number, altType?: any): void;
    function KinkyDungeonPlaceFurniture(barrelChance: number, cageChance: number, width: number, height: number, altType: any): void;
    let KDFood: {
        "": {
            Food: string;
            Weight: number;
        };
        Plate: {
            Food: string;
            inedible: boolean;
            Weight: number;
        };
        Cookies: {
            Food: string;
            Theft: string;
            Weight: number;
        };
        Pizza: {
            Food: string;
            Weight: number;
        };
    };
    function KinkyDungeonPlaceFood(foodChance: number, width: number, height: number, altType: AltType): void;
    function KinkyDungeonPlaceTorches(torchchance: number, torchlitchance: number, torchchanceboring: number, width: number, height: number, _altType: any, torchreplace: any): void;
    function KinkyDungeonReplaceVert(width: number, height: number): void;
    function KinkyDungeonMazeWalls(Cell: any, Walls: GridEntry, WallsList: GridEntry): void;
    function KinkyDungeonMapSet(X: number, Y: number, SetTo: string, VisitedRooms?: any[]): boolean;
    function KinkyDungeonMapSetForce(X: number, Y: number, SetTo: string, VisitedRooms?: any[]): boolean;
    function KinkyDungeonMapDataSet(data: KDMapDataType, X: number, Y: number, SetTo: string): boolean;
    function KinkyDungeonBoringGet(X: number, Y: number): number;
    function KinkyDungeonBoringSet(X: number, Y: number, SetTo: number): boolean;
    function KinkyDungeonMapGet(X: number, Y: number): string;
    function KinkyDungeonMapDataGet(data: KDMapDataType, X: number, Y: number): string;
    function KinkyDungeonVisionSet(X: number, Y: number, SetTo: number): boolean;
    function KinkyDungeonBrightnessSet(X: number, Y: number, SetTo: number, monotonic?: boolean): boolean;
    function KinkyDungeonColorSet(X: number, Y: number, SetTo: number, monotonic?: boolean): boolean;
    function KinkyDungeonShadowSet(X: number, Y: number, SetTo: number, monotonic?: boolean): boolean;
    function KinkyDungeonVisionGet(X: number, Y: number): number;
    function KinkyDungeonBrightnessGet(X: number, Y: number): number;
    function KinkyDungeonColorGet(X: number, Y: number): number;
    function KinkyDungeonShadowGet(X: number, Y: number): number;
    function KinkyDungeonFogGet(X: number, Y: number): any;
    function KinkyDungeonFogSet(X: number, Y: number, val: number): any;
    function KinkyDungeonFogMemoryGet(X: number, Y: number): any;
    function KinkyDungeonFogMemorySet(X: number, Y: number, val: number): any;
    let canvasOffsetX: number;
    let canvasOffsetY: number;
    const canvasOffsetX_ui = 500;
    const canvasOffsetY_ui = 164;
    interface MoveDirection {
        x: number;
        y: number;
        delta: number;
    }
    function KinkyDungeonGetDirection(dx: number, dy: number): MoveDirection;
    function KinkyDungeonGetDirectionRandom(dx: number, dy: number): MoveDirection;
    let KinkyDungeonAutoWaitSuppress: boolean;
    function KinkyDungeonControlsEnabled(): boolean;
    function KDStartSpellcast(tx: number, ty: number, SpellToCast: spell, enemy: any, player: any, bullet: KDBullet, data: any): string;
    function KinkyDungeonClickGame(event: MouseEvent, _Level?: number): boolean;
    function KinkyDungeonGetMovable(): string;
    function KinkyDungeonListenKeyMove(): boolean;
    let KDShopBuyConfirm: boolean;
    function KDEnter(): void;
    function KinkyDungeonGameKeyDown(): boolean;
    function KinkyDungeonGameKeyUp(lastPress: number): boolean;
    function KinkyDungeonSendTextMessage(priority: number, text: string, color: string, time?: number, noPush?: boolean, noDupe?: boolean, entity?: entity, filter?: string): boolean;
    function KinkyDungeonSendActionMessage(priority: number, text: string, color: string, time: number, noPush?: boolean, noDupe?: boolean, entity?: entity, filter?: string, antifilter?: any): boolean;
    let KinkyDungeonNoMoveFlag: boolean;
    function KDAttackCost(weapon?: weapon, noEvent?: boolean): {
        attackCost: number;
        stamPenType: string;
        orig: number;
        bonus: number;
        mult: number;
    };
    function KDShouldCapture(Enemy: entity): boolean;
    function KDShouldTease(Enemy: entity): boolean;
    function KinkyDungeonLaunchAttack(Enemy: entity, skip?: number): string;
    function KDDoAttack(Enemy: entity, teasesub: boolean, attackCost: number, skip: number): {
        result: string;
        skip: number;
    };
    function KDDoCapture(Enemy: entity, attackCost: number, noadvance: boolean, skip: number): void;
    function KDPlayerCanMove(player: any, x: any, y: any): boolean;
    function KinkyDungeonMove(moveDirection: {
        x: number;
        y: number;
    }, delta: number, AllowInteract: boolean, SuppressSprint?: boolean, forceSprint?: boolean): boolean;
    function KinkyDungeonWaitMessage(NoTime: boolean, delta: number, msg?: boolean): void;
    function KinkyDungeonMoveTo(moveX: number, moveY: number, willSprint: boolean, _allowPass: boolean, sprintCost?: number): number;
    function KDBalanceSprint(): boolean;
    function KDCanSprint(cost?: number): boolean;
    let KinkyDungeonLastAction: string;
    let KinkyDungeonLastTurnAction: string;
    let KDDrawUpdate: number;
    let KDVisionUpdate: number;
    let KDLastTick: number;
    function KinkyDungeonAdvanceTime(delta: number, NoUpdate?: boolean, NoMsgTick?: boolean): void;
    let KDEntityFlagCache: Map<any, any>;
    let KDUpdateEntityFlagCache: boolean;
    function KDGetEntityFlagCache(): void;
    let KDItemEventCache: Map<any, any>;
    let KDUpdateItemEventCache: boolean;
    function KDGetItemEventCache(): void;
    let KDAllowDialogue: boolean;
    let lastFloaterRefresh: number;
    function KinkyDungeonTargetTileMsg(): boolean;
    function KDAddAppearance(C: Character, _Group: string, ItemAsset: any, NewColor: string | string[], DifficultyFactor?: number, ItemMemberNumber?: number, _Refresh?: boolean, item?: Item): Item;
    function KDAddModel(C: Character, _Group: string, ItemModel: Model, NewColor: string | string[], filters: Record<string, LayerFilter>, item?: item, Properties?: Record<string, LayerPropertiesType>, factionFilters?: Record<string, FactionFilterDef>): Item;
    function KinkyDungeonCloseDoor(x: number, y: number): void;
    let KDEnemyCache: Map<string, entity>;
    let KDEnemyEventCache: Map<string, Map<number, boolean>>;
    let KDUpdateEnemyCache: boolean;
    let KDIDCache: Map<any, any>;
    function KDGetEnemyCache(): Map<string, entity>;
    let KDTileQuery: string;
    let KDTileLast: any;
    function KDTile(x?: number, y?: number): any;
    function KDTileDelete(x?: number, y?: number): void;
    function KDStunTurns(turns: number, noFlag?: boolean): void;
    function KDKneelTurns(turns: number): void;
    type KDTNamedAndWeighted = {
        name: string;
        weight: number;
    };
    function ListToRecord<T extends KDTNamedAndWeighted>(list: T[]): Record<string, T>;
    type KDTWeighted = {
        weight?: number;
    };
    function GetByWeight<T extends KDTWeighted>(list: Record<string, T>): T;
    function KDGetByWeight(list: Record<string, number>): string;
    let KDKeyCheckers: {
        Toggles: () => boolean;
        Zoom: () => boolean;
        Shop: () => boolean;
        Dialogue: () => boolean;
    };
    function KDGetAltType(Floor: number, MapMod?: string, RoomType?: string): AltType;
    function KDCanPassEnemy(_player: entity, Enemy: entity, force?: boolean, ignoreIfAlready?: boolean): boolean;
    function KDIsInBounds(x: number, y: number, pad?: number): boolean;
    function KDSprintCost(sprintdata?: any, sprintCost?: number, accountForSlow?: boolean): number;
    function KDSetMapFlag(map: KDMapDataType, flag: string): void;
    function KDUpdateForceOutfit(C: Character): void;
    function KDGenerateBaseTraffic(width?: number, height?: number): void;
    function KDPruneWorld(): void;
    function KDEnemyTurnToFace(enemy: entity, x: number, y: number): void;
    function KDTurnToFace(dx: number, dy: number): boolean;
    function KDAddRepopQueue(repopdata: RepopQueueData, data: KDMapDataType): void;
    function KDRepopQueueGet(data: KDMapDataType, x: number, y: number): RepopQueueData[];
    function KDUpdateRepopQueue(data: KDMapDataType, delta: number): void;
    function KDTPToSummit(id: number): void;
    function KDWaitTimeDelayedAction(forceDanger?: boolean): number;
    function KDDelayedActionStart(): void;
    function KDTalkToEnemy(Enemy: entity): boolean;
    function KDFastMoveTo(xx: number, yy: number): number;
    let KDOverrideWaitTimeThreshold: number;
    function KDUpdateWaitTime(delay: number, force?: boolean, nooverride?: boolean): void;
    let KDCustomKeyDown: ((key: any) => boolean)[];
    let KDCustomKeyUp: any[];
    let KDVibeSounds: {
        ItemVulva: {
            sound: string;
            Audio: any;
            update: boolean;
        };
        ItemButt: {
            sound: string;
            Audio: any;
            update: boolean;
        };
        ItemNipples: {
            sound: string;
            Audio: any;
            update: boolean;
            vol: number;
        };
    };
    let KDVibeSoundRedirect: {
        ItemVulva: string;
        ItemVulvaPiercings: string;
        ItemButt: string;
        ItemNipplesPiercings: string;
        ItemNipples: string;
        ItemPelvis: string;
        ItemBreast: string;
        ItemBoots: string;
    };
    let KDVibeSound: {
        ItemVulva: string;
        ItemButt: string;
        ItemNipples: string;
    };
    let KDResolutionConfirm: boolean;
    let KDResolution: number;
    let KDResolutionList: number[];
    let KDResolutionListIndex: number;
    let KDVibeVolume: number;
    let KDVibeVolumeListIndex: number;
    let KDVibeVolumeList: number[];
    let KDMusicVolumeMult: number;
    let KDMusicVolume: number;
    let KDMusicVolumeListIndex: number;
    let KDMusicVolumeList: number[];
    let KDSfxVolume: number;
    let KDSfxVolumeListIndex: number;
    let KDSfxVolumeList: number[];
    let KDAnimSpeed: number;
    let KDAnimSpeedListIndex: number;
    let KDAnimSpeedList: number[];
    let KDGamma: number;
    let KDGammaListIndex: number;
    let KDGammaList: number[];
    let KDWToolsToggleScrollModes: string[];
    let KDWToolsToggleScrollMode: string;
    let KDWToolsToggleScrollModeIndex: number;
    let KDWToolsLayerAbbrModes: string[];
    let KDWToolsLayerAbbrMode: string;
    let KDWToolsLayerAbbrModeIndex: number;
    function KDStopAllVibeSounds(Exceptions?: string[]): void;
    function KDUpdateVibeSound(Location: string, Sound: string, Volume: number): void;
    function KDUpdateVibeSounds(): void;
    function KDSumVibeLocations(): string[];
    function KDGetVibeLocation(item: item): string[];
    function KDRandomizeVibeSound(): string;
    function KinkyDungeonStartVibration(source: string, name: string, locations: string[], intensity: number, duration: number, numLoops?: number, denyTime?: number, denialsLeft?: number, edgeTime?: number, edgeOnly?: boolean, alwaysDeny?: boolean, denialChance?: number, denialChanceLikely?: number, tickEdgeAtMaxArousal?: boolean, vibeMods?: VibeMod[]): void;
    function KDIsVibeCD(cooldown: Record<string, number>): boolean;
    function KinkyDungeonAddVibeModifier(source: string, name: string, location: string, intensityMod: number, duration?: number, intensitySetpoint?: number, edgeOnly?: boolean, forceDeny?: boolean, bypassDeny?: boolean, bypassEdge?: boolean, extendDuration?: boolean, denyChanceMod?: number, denyChanceLikelyMod?: number): void;
    function KinkyDungeonGetDenyChance(chance: number): number;
    function KinkyDungeonVibratorsDeny(chance: number): boolean;
    function KinkyDungeonCalculateVibeLevel(delta: number): void;
    function KinkyDungeonEndVibration(): void;
    function KinkyDungeonCanOrgasm(): boolean;
    const KDAim: KDBuff;
    const KDEquip: KDBuff;
    const KDAim2: KDBuff;
    const KDAim3: KDBuff;
    const KDConduction: KDBuff;
    const KDDrenched: KDBuff;
    const KDAdrenaline: KDBuff;
    const KDAdrenaline2: KDBuff;
    const KDBurning: KDBuff;
    const KDTrainingUnit: KDBuff;
    const KDDisenchant1: KDBuff;
    const KDDisenchant2: KDBuff;
    const KDVolcanism: KDBuff;
    const KDDrenched2: KDBuff;
    const KDDrenched3: KDBuff;
    const KDBoundByFate: KDBuff;
    const KDTaunted: KDBuff;
    const KDPoisonSleep: KDBuff;
    const KDEager: KDBuff;
    const KDMasochist: KDBuff;
    const KDChilled: KDBuff;
    const KDSlimed: KDBuff;
    const KDEncased: KDBuff;
    const KDEncasedMetal: KDBuff;
    const KDEncasedDoll: KDBuff;
    const KDChastity: KDBuff;
    const KDVibrate1: KDBuff;
    const KDVibrate2: KDBuff;
    const KDVibrate3: KDBuff;
    const KDToySecret: KDBuff;
    const KDToy: KDBuff;
    const KDPlugged: KDBuff;
    const KDDoublePlugged: KDBuff;
    const KDTaped: KDBuff;
    const KDGlueVulnLow: KDBuff;
    const KDGlueResist: KDBuff;
    const KDDollDebuff: KDBuff;
    const KDDollDebuff2: KDBuff;
    const KDSlowed: KDBuff;
    const KDSlowedSlightly: KDBuff;
    const KDKnockbackable: KDBuff;
    const KDAttackSlow: KDBuff;
    const KDAntiMagicMiscast: KDBuff;
    const KDUnsteady: KDBuff;
    const KDUnsteady2: KDBuff;
    const KDUnsteady3: KDBuff;
    const KDWaterSlow: KDBuff;
    const KDNoChill: KDBuff;
    const KDNoChillNoAura: KDBuff;
    function KDChillWalk(entity: entity): boolean;
    const KDRestraintDisarmLight: KDBuff;
    const KDRestraintReduceAccuracy: KDBuff;
    const KDBuffReference: Record<string, KDBuff[]>;
    const KDDisenchantSelf: KDBuff;
    let KDCustomBuff: Record<string, (entity: entity, buff: KDBuff) => void>;
    let KDBuffClick: Record<string, (buff: KDBuff, entity: entity) => void>;
    let KDJourneyMapMod: {
        Random: boolean;
    };
    interface KDMapEnemyList {
        enemy: string;
        faction?: string;
        minfloor?: number;
        maxfloor?: number;
        furniture?: Record<string, number>;
        obstacles: Record<string, number>;
        party?: Record<string, number>;
        partytags?: string[];
        partyrequiretags?: string[];
        weightedpartymult?: number;
        randompartymult?: number;
    }
    let KDElevatorHallEnemies: KDMapEnemyList[];
    let KDDefaultMaxFlags: {
        goldchest: number;
        lessergold: number;
        silverchest: number;
        darkchest: number;
        redchest: number;
        bluechest: number;
        forbidden: number;
        artifact: number;
        jail: number;
        playroom: number;
        supplydepot: number;
        barracks: number;
        robotroom: number;
        laboratory: number;
        library: number;
        armory: number;
        workshop: number;
        tinker: number;
        office: number;
        worship: number;
        graveyard: number;
        well: number;
        wildlife: number;
        range: number;
        arena: number;
        arena_boss: number;
        arena_miniboss: number;
        slimespawn: number;
        beastspawn: number;
        magicspawn: number;
        robotspawn: number;
    };
    interface AltType {
        name: string;
        Title?: string;
        bossroom?: boolean;
        noReverse?: boolean;
        width: number;
        height: number;
        genType: string;
        skiptunnel?: boolean;
        spawns: boolean;
        chests: boolean;
        shrines: boolean;
        orbs?: number;
        setpieces: Record<string, number>;
        chargers: boolean;
        notorches?: boolean;
        heart: boolean;
        specialtiles: boolean;
        shortcut: boolean;
        enemies: boolean;
        nojail: boolean;
        nolore?: boolean;
        nokeys: boolean;
        faction?: string;
        nostairs?: boolean;
        notraps?: boolean;
        restricted?: boolean;
        forceCheckpoint?: string;
        noLeave?: boolean;
        noRelease?: boolean;
        releaseOnLowSec?: boolean;
        noClutter?: boolean;
        noTables?: boolean;
        noShrineTypes?: string[];
        tickFlags?: boolean;
        noMusic?: boolean;
        keepMainPath?: boolean;
        musicParams?: string;
        persist?: boolean;
        alwaysRegen?: boolean;
        prune?: boolean;
        keepItems?: boolean;
        constantX?: boolean;
        prisonType?: string;
        beforeWorldGenScript?: (coord: WorldCoord) => void;
        worldGenScript?: (coord: WorldCoord) => void;
        jailType?: string;
        guardType?: string;
        skin?: string;
        useDefaultMusic?: boolean;
        enemyMult?: number;
        useGenParams?: string;
        lightParams?: string;
        bonusTags?: Record<string, {
            bonus: number;
            mult: number;
        }>;
        alwaysAdvance?: boolean;
        noAdvance?: boolean;
        keepRebels?: boolean;
        keepPrisoners?: boolean;
        noWear?: boolean;
        placeJailEntrances?: boolean;
        sameFactionJailOnly?: boolean;
        friendlyFactionOnly?: boolean;
        allowJailEntrances?: boolean;
        nopatrols?: boolean;
        private?: boolean;
        isPrison?: boolean;
        startatstartpos?: boolean;
        nostartstairs?: boolean;
        nobrick?: boolean;
        noboring?: boolean;
        torches?: boolean;
        wanderTags?: Record<string, number>;
        sizeBonus?: boolean;
        loreCheckpoint?: string;
        brightness?: number;
        placeDoors?: boolean;
        noSetpiece?: boolean;
        makeMain?: boolean;
        requireJourneyTarget?: boolean;
        noQuests?: boolean;
        removePartyMembers?: boolean;
        escapeMethod?: string;
        factionSpawnsRequired?: boolean;
        torchreplace?: {
            sprite: string;
            unlitsprite: string;
            brightness: number;
        };
        noFurniture?: boolean;
        noFood?: string;
        doorPlaceMode?: number;
        noPersistentPrisoners?: boolean;
        noPersistentSpawn?: boolean;
        norestock?: boolean;
        events?: KinkyDungeonEvent[];
        data?: any;
        genCriteria?: (iteration: number) => boolean;
        elevatorCondition?: (x: number, y: number) => boolean;
        onExit?: (data: any) => void;
        drawscript?: (_delta: any, CamX: number, CamY: number, CamX_offsetVis: number, CamY_offsetVis: number) => void;
        afterExit?: (data: any) => void;
        loadscript?: (firsttime: boolean) => boolean;
        updatescript?: (delta: number) => void;
    }
    let alts: Record<string, AltType>;
    let KDJourneyList: string[];
    let KDJourneyListSkin: {
        Random: string;
        Harder: string;
        Temple: string;
        Explorer: string;
        Doll: string;
    };
    function KinkyDungeonAltFloor(Type: string): AltType;
    let KinkyDungeonCreateMapGenType: Record<string, (POI: any[], VisitedRooms: any[], width: number, height: number, openness: number, density: number, hallopenness: number, data: any) => void>;
    function KinkyDungeonCreateMaze(POI: any[], VisitedRooms: any[], width: number, height: number, openness: number, density: number, hallopenness: number, data: any): void;
    function KinkyDungeonCreateCaldera(POI: any[], VisitedRooms: any, width: number, height: number, openness: number, density: number, _hallopenness: number, data: any): void;
    let usePrimmMaze: boolean;
    function KinkyDungeonCreateTileMaze(_POI: any[], VisitedRooms: any[], width: number, height: number, openness: number, density: number, _hallopenness: number, data: any): void;
    function KinkyDungeonCreateRoom(_POI: any, _VisitedRooms: any[], width: number, height: number, _openness: number, _density: number, _hallopenness: number, _data: any): void;
    function KinkyDungeonCreateDollStorage(_POI: any, VisitedRooms: any[], _width: number, height: number, _openness: number, _density: number, _hallopenness: number, data: any): void;
    function KinkyDungeonCreateSummit(_POI: any, VisitedRooms: any[], _width: number, _height: number, _openness: number, _density: number, _hallopenness: number, data: any): void;
    function KinkyDungeonCreateDollRoom(_POI: any, _VisitedRooms: any[], width: number, height: number, _openness: number, _density: number, _hallopenness: number, _data: any): void;
    function KinkyDungeonCreateDemonTransition(POI: any, VisitedRooms: any[], width: number, height: number, _openness: number, _density: number, _hallopenness: number, data: any): void;
    function KinkyDungeonCreateDollmaker(_POI: any, _VisitedRooms: any[], _width: number, _height: number, _openness: number, _density: number, _hallopenness: number, data: any): void;
    function KinkyDungeonCreateWarden(_POI: any, _VisitedRooms: any[], _width: number, _height: number, _openness: number, _density: number, _hallopenness: number, data: any): void;
    function KinkyDungeonCreateTunnel(_POI: any, VisitedRooms: any[], width: number, height: number, _openness: number, _density: number, _hallopenness: number, data: any): void;
    function KinkyDungeonCreatePerkRoom(POI: any, VisitedRooms: any[], width: number, height: number, _openness: number, _density: number, _hallopenness: number, _data: any): void;
    function KinkyDungeonCreateJourneyFloor(_POI: any, VisitedRooms: any[], width: number, height: number, _openness: number, _density: number, _hallopenness: number, _data: any): void;
    function KinkyDungeonCreateShopStart(_POI: any, VisitedRooms: any[], width: number, height: number, _openness: number, _density: number, _hallopenness: number, data: any): void;
    function KinkyDungeonCreateGoldVault(_POI: any, VisitedRooms: any[], _width: number, height: number, _openness: number, _density: number, _hallopenness: number, data: any): void;
    function KinkyDungeonCreateElevatorRoom(_POI: any, VisitedRooms: any[], _width: number, height: number, _openness: number, _density: number, _hallopenness: number, data: any): void;
    function KinkyDungeonCreateElevatorEgyptian(_POI: any, VisitedRooms: any[], _width: number, height: number, _openness: number, _density: number, _hallopenness: number, data: any): void;
    function KinkyDungeonCreateElevatorEgyptian2(_POI: any, VisitedRooms: any[], _width: number, height: number, _openness: number, _density: number, _hallopenness: number, data: any): void;
    function KinkyDungeonCreateTestTile(_POI: any, VisitedRooms: any[], width: number, height: number, _openness: number, _density: number, _hallopenness: number, data: any): void;
    function KinkyDungeonCreateTutorial(_POI: any, VisitedRooms: any[], width: number, height: number, _openness: number, _density: number, _hallopenness: number, _data: any): void;
    function KDGenerateShopVisitors(): void;
    function KDEnumerateShopVisitors(): Record<string, number>;
    let KDNoDragonLairCheckpoints: string[];
    let KDDragonList: KDMapEnemyList[];
    function KDMapgenCreateCave(POI: any, VisitedRooms: any, width: any, height: any, openness: any, density: any, hallopenness: any, data: any): void;
    function KDGetDragonLairFurnitureZones(spacingX: number, spacingY: number, minDist: number, xCenter: number, yCenter: number): KDPoint[];
    function KDGetDragonType(): KDMapEnemyList;
    let KDCreationScripts: Record<string, (entity: entity, coord: WorldCoord) => boolean>;
    interface KDLair {
        Name: string;
        RoomType: string;
        OwnerNPC?: number;
        OwnerFaction?: string;
        Entrance: Record<string, string>;
        EntranceTo: Record<string, string>;
        PlaceScriptOverride?: string;
        Hidden?: boolean;
        UpStairsFrom?: string;
        data?: any;
    }
    let KDPersonalAlt: {
        [_: string]: KDLair;
    };
    interface lairType {
        Entrances?: Record<string, string>;
        DefaultEntrance: string;
        EntrancesFrom?: Record<string, string>;
        DefaultEntranceFrom: string;
        AlwaysHide?: boolean;
    }
    let KDLairTypes: Record<string, lairType>;
    function KDGenerateLairNameFromEnemy(RoomType: string, enemy: entity): string;
    function KDGetLairs(slot: KDWorldSlot, id?: number): [string, string][];
    function KDGetOutposts(slot: KDWorldSlot, faction?: number): [string, string][];
    function KDAddLair(slot: KDWorldSlot, room: string, alt: string, id: number, hidden: boolean, entrance: string, fromRoom?: string, fromRoomEntrance?: string, entranceFrom?: string, alwaysGet?: boolean): string;
    function KDOutpostID(faction: string, alt: string, slot: KDPoint): string;
    function KDAddOutpost(slot: KDWorldSlot, room: string, alt: string, faction: string, hidden: boolean, entrance: string, fromRoom?: string, fromRoomEntrance?: string, entranceFrom?: string, alwaysGet?: boolean): string;
    function KDDoLairOutpostConnections(slot: KDWorldSlot, id: string, roomFrom: string, entranceType: string, entranceTypeFrom: string): boolean;
    function KDBuildLairs(): void;
    function KDFindEntrance(lair: KDLair, data: KDMapDataType): LairEntrance;
    function KDFindEntranceTo(lairFrom: KDLair, roomTo: string, data: KDMapDataType): LairEntrance;
    function KDPlaceLairEntrance(lair: KDLair, data: KDMapDataType, entrance: LairEntrance, roomTo?: string): boolean;
    interface LairEntrance {
        Type: string;
        x: number;
        y: number;
        Excavate: KDPoint[];
        PlaceScript: string;
        priority?: number;
    }
    let KDLairTypePlaceScript: Record<string, (lair: KDLair, data: KDMapDataType, entrance: LairEntrance, roomTo?: string) => boolean>;
    let KDLairEntrancePlaceScript: Record<string, (lairData: KDLair, data: KDMapDataType, entrance: LairEntrance, roomTo?: string) => boolean>;
    function KDGenHighSecCondition(force: boolean, enemy: entity): boolean;
    let KDLairEntranceFilterScript: Record<string, (lair: KDLair, data: KDMapDataType, entrance: LairEntrance, roomTo?: string) => number>;
    function KDMakeShortcutStairs(lair: KDLair, point: KDPoint, data: KDMapDataType, roomTo?: string): boolean;
    interface KDRegiment {
        id: number;
        location: WorldCoord;
        room: string;
    }
    function KDGetRegiments(location?: {
        x: number;
        y: number;
    }, Room?: string): KDRegiment[];
    function UpdateRegiments(coords: WorldCoord): void;
    let KDMapTickTime: number;
    let KDMapTickRange: number;
    function KDTickMaps(delta: number, minFloor: number, maxFloor: number, onlyMain: false, updateReg: boolean, updateChests: boolean): boolean;
    let KDRefillChestInterval: number;
    let KDRefillChestChance: number;
    function KDRefillChests(data: KDMapDataType): void;
    function KDRefillTick(x: number, y: number, data: KDMapDataType): void;
    let KDRefillTypes: {
        Chest: (x: number, y: number, tile: any, data: KDMapDataType) => void;
    };
    let KinkyDungeonBones: {};
    let KDPatronAdventurers: any[];
    let KDPatronCustomEnemies: Map<string, ({
        name: string;
        color: string;
        prisoner: boolean;
        free: boolean;
        customPlayLine: string;
        customOutfit: string;
        customStyle: string;
        customIntro: string;
        customSprite: string;
    } | {
        name: string;
        color: string;
        prisoner: boolean;
        free: boolean;
        customPlayLine: string;
        customIntro: string;
        customSprite: string;
        customOutfit?: undefined;
        customStyle?: undefined;
    })[] | ({
        name: string;
        color: string;
        prisoner: boolean;
        free: boolean;
        customPlayLine: string;
        customIntro: string;
        customSprite: string;
        pets: {
            Frog: {
                name: string;
                color: string;
                prisoner: boolean;
                free: boolean;
                customPlayLine: string;
                customIntro: string;
                customSprite: string;
            }[];
        };
        customStyle?: undefined;
        customOutfit?: undefined;
    } | {
        name: string;
        color: string;
        prisoner: boolean;
        free: boolean;
        customPlayLine: string;
        customIntro: string;
        customSprite: string;
        customStyle: string;
        customOutfit: string;
        pets: {
            Frog: {
                name: string;
                color: string;
                prisoner: boolean;
                free: boolean;
                customPlayLine: string;
                customIntro: string;
                customSprite: string;
            }[];
        };
    })[] | ({
        name: string;
        color: string;
        prisoner: boolean;
        free: boolean;
        customPlayLine: string;
        customIntro: string;
        customSprite: string;
        customStyle?: undefined;
        customOutfit?: undefined;
        customOutfitBound?: undefined;
    } | {
        name: string;
        color: string;
        prisoner: boolean;
        free: boolean;
        customPlayLine: string;
        customStyle: string;
        customOutfit: string;
        customOutfitBound: string;
        customIntro: string;
        customSprite: string;
    })[] | ({
        name: string;
        color: string;
        prisoner: boolean;
        free: boolean;
        customPlayLine: string;
        customStyle: string;
        customOutfit: string;
        customSprite: string;
        customIntro?: undefined;
    } | {
        name: string;
        color: string;
        prisoner: boolean;
        free: boolean;
        customPlayLine: string;
        customIntro: string;
        customStyle?: undefined;
        customOutfit?: undefined;
        customSprite?: undefined;
    })[]>;
    let KDPatronsSpecial: {
        "Anonymous ": number;
        cyberjoel: number;
        "finn ": number;
        "Samantha Lear": number;
        "Private ": number;
        "Chet Vargas": number;
        "Siegfried K\u00FCbler": number;
        Song: number;
        "The-Fisher-King": number;
        Churro: number;
        "Laioken ": number;
        "Wyatt Wintersoul": number;
        "Dex\u266A ": number;
        "Anthony Royle": number;
        "Shogo ": number;
        "Gamefan ": number;
        "Blox ": number;
        "Jerome Peterson": number;
        "selly-grim ": number;
        "Alexis Octavia": number;
        "Noxgarm ": number;
        Slacker: number;
        "Hellgete ": number;
        "Flame ": number;
        "WATA ": number;
        FrenzyFlame: number;
        "Kieraakari ": number;
        Loudest_Quiet_Person: number;
        Rest: number;
        "atetete ": number;
        "Mechio ": number;
        "Dazman1234 ": number;
        Thefabulousglaceon: number;
        Rika: number;
        "0xA4C1B842": number;
        "LukeB ": number;
        "devan ": number;
        Physicsphail: number;
        Miro: number;
        "Loony ": number;
        WhiteSniper: number;
        Thatguu: number;
        "Somprad ": number;
        "Geng114514 ": number;
        "John  Toenniessen": number;
        "Cat Hawke": number;
        Míša: number;
        "RappyTheToy ": number;
        Diablo200: number;
        "Cerb ": number;
        "isaiah lewis": number;
        Mellenia: number;
        LordFabricator: number;
        "Zero K": number;
        "Dakra ": number;
        "Victor ": number;
        "damit damit": number;
        "nnm711 ": number;
        Dragokahn: number;
        Meekohi: number;
        "Phoenix ": number;
        "zipidyzap ": number;
        Cera: number;
        "CuvyanTaylor ": number;
        "anton allison": number;
        "Shrimpy ": number;
        "Tatsuya Shiba": number;
        "Snekus ": number;
        nuzzels: number;
        "Minescence ": number;
        "HanQing Zhao": number;
        "James Kirkman": number;
        "OTKTamashii ": number;
        "darklink11 ": number;
        Hannes: number;
        "Arentios ": number;
        Nymjii: number;
        Linex: number;
        "Mister Mythe": number;
        "CMDR Salen": number;
        "bl ah": number;
        Salmon: number;
        Trinan: number;
        sqrt10pi: number;
        "hopefast ": number;
        jeepk36: number;
        Shakymunch: number;
        Samsy: number;
        "Pyros51 ": number;
        Aussie895: number;
        Hungvipbcsok: number;
        "hideki hirose": number;
        "Girador ": number;
        "Traynfreek ": number;
        GRASS: number;
        "Heavy Blues": number;
        "Pyron ": number;
        "Kritsanapong Jarutatpimol": number;
        "Hanqing Zhao": number;
        "Yagami Yami": number;
        "Wossa ": number;
        FlameTail: number;
        "\u706B\u62AB\u85A9 \u6C34": number;
        "Sewdah nim": number;
        Crimson: number;
        X27: number;
        Nyarlato: number;
        Nightkin: number;
        Sylicix: number;
        "Null Fame": number;
        "AdventCirno ": number;
        "Sera The Crocsune": number;
        "Masaki Hara": number;
        "Eric Rothman": number;
        "\uC601\uC2B9 \uBC15": number;
        "Claire Stephens": number;
        "koch ": number;
        Joecoolzx: number;
        "\u68EE \u97E9": number;
        "ComradeArmtyom ": number;
        "Hjake2 ": number;
        "Chen yu": number;
        Sinohisaki: number;
        "linlizheng ": number;
        john1304: number;
        Zora: number;
        "suddys ": number;
        "Robert Gomez": number;
        "\u4EA6\u658C \u9673": number;
        Feltenix: number;
        "Aika ": number;
        sCaREaGle: number;
        "Mike Salot": number;
        "Roger Gamer": number;
    };
    let KDPatrons: string[];
    function KDProcessCustomPatron(Enemy: enemy, e: entity, chanceBoost: number, makePersistent: boolean): any;
    function KDProcessCustomPatronPet(pets: any[], e: entity, index: number): any;
    let KDMapMods: Record<string, MapMod>;
    function KDGetMapGenList(count: number, mods: Record<string, MapMod>, slot: KDJourneySlot): MapMod[];
    let KDSideRooms: Record<string, KDSideRoom>;
    function KDGetSideRoom(slot: KDJourneySlot, side: boolean, ignore: string[], requireTag?: string): KDSideRoom;
    interface AltTypeBoss extends AltType {
        boss: string;
        bossroom: true;
    }
    let bosses: Record<string, AltTypeBoss>;
    function KinkyDungeonBossFloor(Floor: number): AltTypeBoss;
    let KDMinimapIcons: Record<string, (_x: number, _y: number) => string>;
    let KDMinimapLabels: Record<string, (_x: number, _y: number, force: boolean) => string>;
    let KDDoorKnobChance: number;
    let KDDoorKnobChanceArms: number;
    let KDDoorAttractChance: number;
    let KDDoorAttractChanceArms: number;
    let KDPERKCOSTMULT: number;
    let kdStartWeapons: string[];
    let KDPerkParams: {
        KDEnemyDamageMult: number;
        KDEnemyResistBuff: number;
        KDEnemyArmorBoost: number;
    };
    let KDCategoriesStart: {
        name: string;
        buffs: any[];
        debuffs: any[];
    }[];
    let KDKinkyPerks: string[];
    let KDPerkIcons: {
        Pacifist: () => boolean;
        BerserkerRage: () => boolean;
        BoundPower: () => boolean;
        UnstableMagic: () => boolean;
        BurningDesire: () => boolean;
        FrigidPersonality: () => boolean;
        ImmovableObject: () => boolean;
        GroundedInReality: () => boolean;
        LikeTheWind: () => boolean;
        LeastResistance: () => boolean;
    };
    let KDPerkUpdateStats: {
        Rigger: () => void;
        Ticklish: () => void;
        Stoic: () => void;
        Lascivious: () => void;
        Unperturbed: () => void;
        PainTolerance: () => void;
        Sticky: () => void;
        EnemyResist: () => void;
        BoundPower: () => void;
        BerserkerRage: () => void;
        Dodge: () => void;
        StartShadow: () => void;
        UnstableMagic: () => void;
        CommonLatex: () => void;
        CommonLeather: () => void;
        CommonMaid: () => void;
        CommonWolf: () => void;
        CommonDress: () => void;
        CommonFuuka: () => void;
        CommonWarden: () => void;
        CommonCyber: () => void;
        CommonExp: () => void;
        CommonKitty: () => void;
        CommonToyPleasure: () => void;
        CommonToyEdge: () => void;
        CommonToyDeny: () => void;
        CommonToyTease: () => void;
    };
    let KDPerkCount: Record<string, () => string>;
    let KinkyDungeonStatsPresets: Record<string, KDPerk>;
    function KDGetPerkCost(perk: KDPerk): number;
    function KinkyDungeonGetStatPoints(Stats: Map<any, any>): number;
    function KDCanPickPerk(Perk: string, points?: number): boolean;
    function KDValidatePerk(stat: KDPerk): boolean;
    function KDPerkBlocked(perk1: string, perk2: string): boolean;
    function KinkyDungeonCanUnPickStat(Stat: string): boolean;
    function KDInitPerks(): void;
    let KDPerkStart: {
        Studious: () => void;
        Submissive: () => void;
        Pacifist: () => void;
        Rigger: () => void;
        Unchained: () => void;
        FuukaCollar: () => void;
        QuakeCollar: () => void;
        WardenBelt: () => void;
        Prisoner: () => void;
        Slayer: () => void;
        Conjurer: () => void;
        Magician: () => void;
        Brawler: () => void;
        NovicePet: () => void;
        SelfBondage: () => void;
        HeelTraining: () => void;
        HeadStartHeels: () => void;
        CorsetTraining: () => void;
        HeadStartCorset: () => void;
        StartLatex: () => void;
        DollmakerVisor: () => void;
        DollmakerMask: () => void;
        StartCyberDollStorage: () => void;
        StartLatexIntegration: () => void;
        StartCyberDoll: () => void;
        StartMaid: () => void;
        StartWolfgirl: () => void;
        StartObsidian: () => void;
        Hogtied: () => void;
        Bandit: () => void;
        Stranger: () => void;
        WrongNeighborhood: () => void;
        Cursed: () => void;
        MC_Trainee: () => void;
        MC_Wizard: () => void;
        MC_Rogue: () => void;
        MC_Peasant: () => void;
        MC_Fighter: () => void;
    };
    let KDPerksFilter: string;
    let KDPerksButtonWidth: number;
    let KDPerksButtonWidthPad: number;
    let KDPerksButtonHeight: number;
    let KDPerksButtonHeightPad: number;
    let KDPerksXPad: number;
    let KDPerksYPad: number;
    let KDPerksYStart: number;
    let KDPerksXStart: number;
    let KDPerksMaxY: number;
    let KDPerksScroll: number;
    let KDPerksIndex: number;
    let KDPerksIndexUI: number;
    let KDPerksIndexUIWeight: number;
    let KDCategories: any[];
    function KinkyDungeonDrawPerks(NonSelectable: boolean): boolean;
    function drawVertList(list: any[], x: number, y: number, w: number, h: number, max: number, fontSize: number, clickfnc: (a: any) => ((a: any) => boolean), prefix: string): void;
    function drawHorizList(list: any[], x: number, y: number, w: number, h: number, max: number, fontSize: number, clickfnc: (a: any) => ((a: any) => boolean), prefix: string, reverse: boolean): void;
    function KDGetRandomPerks(existing: Record<string, boolean>, debuff?: boolean, threshold?: number): string[];
    function KDGetPerkShrineBondage(perks: string[]): string[];
    const KinkyDungeonMapParams: Record<mapKey, floorParams>;
    let KDBaseFogMemory: number;
    let KDRedrawFog: number;
    let KDRedrawMM: number;
    let KinkyDungeonSeeAll: boolean;
    let KDVisionBlockers: Map<any, any>;
    let KDLightBlockers: Map<any, any>;
    function KinkyDungeonCheckProjectileClearance(xx: number, yy: number, x2: number, y2: number, playerblock?: boolean): boolean;
    function KinkyDungeonCheckPathCount(x1: number, y1: number, x2: number, y2: number, allowBars: boolean, blockEnemies: boolean, maxFails: number, blockOnlyLOSBlock: boolean): number;
    function KinkyDungeonCheckPath(x1: number, y1: number, x2: number, y2: number, allowBars?: boolean, blockEnemies?: boolean, maxFails?: number, blockOnlyLOSBlock?: boolean): boolean;
    let KDPlayerLight: number;
    let KDMapBrightnessMult: number;
    let GiantMapOptimizations: number;
    let KDSparseLightCache: Record<string, string>;
    function KinkyDungeonResetFog(): void;
    function KDGetLightsCache(lights: KDLight[], lightmap: Map<string, number>): Record<string, string>;
    function KinkyDungeonMakeBrightnessMap(_width: number, _height: number, mapBrightness: number, Lights: any[], delta: number): void;
    function KDAvgColor(color1: number, color2: number, w1: number, w2: number): number;
    function KinkyDungeonMakeVisionMap(width: number, height: number, Viewports: any, Lights: any, delta: number, _mapBrightness: number): void;
    let KDLightCropValue: number;
    function KDDrawFog(CamX: number, CamY: number, CamX_offset: number, CamY_offset: number, _CamX_offsetVis: number, _CamY_offsetVis: number): void;
    function KDMinimapWidth(): number;
    function KDMinimapHeight(): number;
    function KDUpdateMinimapTarget(force?: boolean): void;
    let KDExpandMinimap: boolean;
    let KDMinimapScale: number;
    let KDMinimapScaleBig: number;
    let KDMinimapW: number;
    let KDMinimapH: number;
    let KDMinimapBaseSize: number;
    let KDMinimapExpandedSize: number;
    let KDMinimapExpandedSizeTick: number;
    let KDMinimapWBig: number;
    let KDMinimapHBig: number;
    let KDMinimapAlpha: number;
    let KDMinimapExpandedZoom: number;
    let KDMinimapExpandedZoomTick: number;
    let KDMinimapWCurrent: number;
    let KDMinimapHCurrent: number;
    let KDMinimapWTarget: number;
    let KDMinimapHTarget: number;
    let KDMinimapSoftTextBoostWidth: number;
    let KDMinimapSoftTextBoostWidthCMult: number;
    let KDMMReadabilityBoost: number;
    let KDMMBoostExp: number;
    function KDRenderMinimap(x: number, y: number, w: number, h: number, scale: number, alpha: number, gridborders: boolean, blackMap: boolean): void;
    function KDAllowFog(): boolean;
    function KDRevealTile(x: number, y: number, amount: number): void;
    let QuestCompleteWeight: number;
    let KDDefaultGoddessQuestRep: number;
    let KDQuests: Record<string, KDQuest>;
    function KDQuestList(count: number, mods: Record<string, KDQuest>, RoomType: string, MapMod: string, data: any): KDQuest[];
    function KDQuestWorldgenStart(quests: string[]): void;
    function KDQuestTick(quests: string[], delta: number): void;
    function KDRemoveQuest(quest: string, force?: boolean, intentional?: boolean, success?: boolean): boolean;
    function KDAddQuest(quest: string): void;
    function KDHasQuest(quest: string): boolean;
    let KDQuestsIndex: number;
    let KDQuestsVisible: number;
    let KDMaxQuests: number;
    function KinkyDungeonDrawQuest(): void;
    function KDGetQuestData(quest: string): any;
    function KDSetQuestData(quest: string, data: any): void;
    function KDGenQuestTemplate(Name: string, Icon: string, Goddess: string, spawnFunction: (Goddess: string, Flag: string) => void, restraintsCountMult: number, restraintsTags: string[], Loot?: string, Rep?: number): KDQuest;
    function KDSortQuests(player: entity): void;
    function FactionQuestDummy(faction: string, npc: string): KDQuest;
    let KinkyDungeonLostItems: item[];
    let KDTightRestraintsMod: number;
    let KDTightRestraintsMult: number;
    let KDPartialLootRecoveryChance: number;
    function KinkyDungeonAddLostItems(list: item[], excludeBound: boolean): void;
    let cursedRestraintCache: {};
    let KinkyDungeonSpecialLoot: boolean;
    let KinkyDungeonLockedLoot: boolean;
    function KinkyDungeonLoot(Level: number, Index: string, Type: string, roll?: number, tile?: any, returnOnly?: boolean, noTrap?: boolean, minWeight?: number, minWeightFallback?: boolean, container?: KDContainer, lootType?: any[]): boolean | any;
    function KinkyDungeonLootEvent(Loot: any, Floor: number, Replacemsg: string, Lock?: string, container?: KDContainer): string;
    function KinkyDungeonAddGold(value: number): void;
    function KDSpawnLootTrap(x: number, y: number, _trap: any, _mult: number, duration: number): void;
    function KDGenChestTrap(guaranteed: boolean, x: number, y: number, chestType: string, lock: any, noTrap: boolean): any;
    let KDChestTrapWeights: {
        metalTrap: {
            weight: () => number;
            mult: number;
            time: number;
        };
        leatherTrap: {
            weight: () => number;
            mult: number;
            time: number;
        };
        latexTrap: {
            weight: () => number;
            mult: number;
            time: number;
        };
        ropeTrap: {
            weight: () => number;
            mult: number;
            time: number;
        };
        illusionTrap: {
            weight: () => number;
            mult: number;
        };
        skeletonTrap: {
            weight: () => 0 | 300;
            mult: number;
        };
        zombieTrap: {
            weight: () => 0 | 300;
            mult: number;
        };
        mummyTrap: {
            weight: () => 0 | 300;
            mult: number;
        };
        mushroomTrap: {
            weight: () => 0 | 300;
            mult: number;
        };
    };
    type trapChestFunc = (guaranteed: boolean, x: number, y: number, chestType: string, lock: any, noTrap: boolean) => {
        trap: string;
        mult: number;
        time: number;
        duration?: number;
    };
    let KDTrapChestType: Record<string, trapChestFunc>;
    function KDTriggerLoot(Loot: string, Type: string): void;
    function KDGetWeightedString(WeightList: Record<string, any>, params?: any): any;
    function KDCanCurse(tags: string[]): boolean;
    function KDGetCursedEpicenterLoot(enemy: entity): string;
    function KDSummonCurseTrap(x: number, y: number): entity;
    function KDGenerateMinorLoot(lootType: string, coord: WorldCoord, tile: any, x: number, y: number, container: KDContainer): void;
    function KDGetCursedSuffix(armor: string): "" | "Common" | "Cursed";
    function KDGetCursedTags(item: item): string[];
    let KDTooltipListExtraCutoff: number;
    let KDTooltipListExtraCutoffHigh: number;
    let KDTooltipListExtraPage: number;
    let KDShowExtraTooltipCycle: number;
    let KDShowExtraTooltipMaxCycle: number;
    let KDEnemyStruggleHPExp: number;
    let KDOpinionThreshold: number;
    let KDDespawnDistance: number;
    let KDDebugOverlay2: boolean;
    let KDEnemiesCache: Map<any, any>;
    let KinkyDungeonSummonCount: number;
    let KinkyDungeonEnemyAlertRadius: number;
    let KDStealthyMult: number;
    let KDConspicuousMult: number;
    let commentChance: number;
    let actionDialogueChance: number;
    let actionDialogueChanceIntense: number;
    let KDDefaultEnemyMoveSound: number;
    let KDDefaultEnemyAttackSound: number;
    let KDDefaultEnemyCastSound: number;
    let KDDefaultEnemyIdleSound: number;
    let KDDefaultEnemyAlertSound: number;
    let KDEventableAttackTypes: string[];
    let KDPlayerNoiseSources: {
        Movement: {
            calc: (_player: entity) => 0 | 4;
        };
        Sprint: {
            calc: (_player: entity) => 0 | 9;
        };
    };
    let KDAnims: Record<string, (entity: entity) => boolean>;
    function KDAnimQuantize(step: number, amount: number): number;
    function KinkyDungeonRefreshEnemiesCache(): void;
    function KinkyDungeonGetEnemyByName(Name: string | enemy): enemy;
    function KinkyDungeonNearestJailPoint(x: number, y: number, filter?: string[], any?: boolean, qualified?: boolean, unnocupied?: boolean, criteria?: (x: any, y: any, point: any) => boolean): KDJailPoint;
    function KDLockNearbyJailDoors(x: number, y: number): void;
    function KinkyDungeonRandomJailPoint(filter?: string[], exclude?: KDJailPoint[]): KDJailPoint;
    function KinkyDungeonNearestPatrolPoint(x: number, y: number): number;
    let KinkyDungeonFlags: Map<string, number>;
    function KinkyDungeonSetFlag(Flag: string, Duration: number, Floors?: number): void;
    function KinkyDungeonUpdateFlags(delta: number): void;
    function KinkyDungeonGetPatrolPoint(index: number, radius: number, Tiles: string): {
        x: number;
        y: number;
    };
    function KDGetBindAmp(enemy: entity, override?: number): number;
    function KDHelpless(enemy: entity): boolean;
    function KDIsHopeless(enemy: entity): boolean;
    function KDEnemyVisionRadius(enemy: entity): number;
    function KinkyDungeonNearestPlayer(enemy: entity, _requireVision?: boolean, decoy?: boolean, visionRadius?: number, _AI_Data?: KDAIData): any;
    function KDEnemyHidden(enemy: entity): boolean;
    let KDDespawnPartyDist: number;
    function KDEnemyCanDespawn(id: number, mapData: KDMapDataType, PMDist?: number): boolean;
    function KDEnemyNearTargetExit(entity: entity, mapData: KDMapDataType): boolean;
    function KDGetShortcutPosition(target: string, x: number, y: number, mapData: KDMapDataType): any;
    function KDGetNearestExit(x: number, y: number, mapData: KDMapDataType, backup?: boolean): KDPoint;
    function KDGetNearestExitTo(roomTo: string, mapX: number, mapY: number, x: number, y: number, mapData: KDMapDataType, backup?: boolean): KDPoint;
    function KinkyDungeonInDanger(): boolean;
    function KDAmbushAI(enemy: entity): boolean;
    let KinkyDungeonFastMoveSuppress: boolean;
    let KinkyDungeonFastStruggleSuppress: boolean;
    let KDInDanger: boolean;
    function KinkyDungeonDrawEnemies(_canvasOffsetX: number, _canvasOffsetY: number, CamX: number, CamY: number): void;
    function KDDrawEnemySprite(board: PIXIContainer, enemy: entity, tx: number, ty: number, CamX: number, CamY: number, StaticView?: boolean, zIndex?: number, id?: string): string;
    function KDAnimEnemy(Entity: entity): {
        offX: number;
        offY: number;
    };
    function KDSetCollFlag(id: number, flag: string, duration: number): void;
    function KDCollHasFlag(id: number, flag: string): boolean;
    function KinkyDungeonSetEnemyFlag(enemy: entity, flag: string, duration?: number): void;
    function KDSetIDFlag(id: number, flag: string, duration: number): void;
    function KDEnemyHasFlag(enemy: entity, flag: string): boolean;
    function KDIDHasFlag(id: number, flag: string): boolean;
    function KDEntityHasFlag(enemy: entity, flag: string): boolean;
    function KinkyDungeonDrawEnemiesStatus(canvasOffsetX: number, canvasOffsetY: number, CamX: number, CamY: number): void;
    let KDLastEnemyWarningDelta: number;
    interface WarningTileRecord {
        type: number;
        source: number;
        sx: number;
        sy: number;
        x: number;
        y: number;
    }
    function KinkyDungeonDrawEnemiesWarning(_canvasOffsetX: number, _canvasOffsetY: number, CamX: number, CamY: number): void;
    function KinkyDungeonBar(x: number, y: number, w: number, h: number, value: number, foreground?: string, background?: string, orig?: number, origColor?: string, notches?: number[], notchcolor?: string, notchbg?: string, zIndex?: number): void;
    function KinkyDungeonBarTo(canvas: PIXIContainer, x: number, y: number, w: number, h: number, value: number, foreground?: string, background?: string, orig?: number, origColor?: string, notches?: number[], notchcolor?: string, notchbg?: string, zIndex?: number): void;
    function KinkyDungeonCircleBar(x: number, y: number, r: number, linewidth: number, value: number, rotation: number, foreground?: string, background?: string, orig?: number, origColor?: string, notches?: number[], notchcolor?: string, notchbg?: string, zIndex?: number): void;
    function KinkyDungeonCircleBarTo(canvas: PIXIContainer, x: number, y: number, r: number, linewidth: number, value: number, rotation: number, foreground?: string, background?: string, orig?: number, origColor?: string, notches?: number[], notchcolor?: string, notchbg?: string, zIndex?: number): void;
    function KDCanSeeEnemy(enemy: entity, playerDist?: number): boolean;
    function KDMaxEnemyViewDist(enemy: entity): number;
    function KDEnemyHasHelp(enemy: entity): boolean;
    function KDGetHelpers(enemy: entity): entity[];
    function KDGetEnemyStruggleMod(enemy: entity, force: boolean, defaultSpeed: boolean, hasHelp?: boolean): number;
    function KDGetEnemyDistractRate(enemy: entity, vibe: number): number;
    function KDGetEnemyDistractionDamage(enemy: entity, vibe: number): number;
    function KDGetEnemyReleaseDamage(enemy: entity, nokill?: boolean, intensity?: number): any;
    let KDMaxBindingBars: number;
    function KDEaseValue(delta: number, currentval: number, targetval: number, rate: number, minrate: number, eps?: number): number;
    let KDBarAdvanceRate: number;
    let KDBarAdvanceRateMin: number;
    function KDGetMaxShield(enemy: entity): number;
    function KDGetShieldRegen(enemy: entity): number;
    function KDEaseBars(enemy: entity, delta: number): void;
    function KinkyDungeonDrawEnemiesHP(delta: number, canvasOffsetX: number, canvasOffsetY: number, CamX: number, CamY: number, _CamXoffset: number, CamYoffset: number): void;
    let KDDialogueSlots: {};
    function KDEnemyName(enemy: entity): string;
    function KDEnemyNameColor(enemy: entity): string;
    function KDGetName(id: number): string;
    function KDGetNameColor(id: number): string;
    function KDResyncBondage(en: entity): void;
    function KDSetToExpectedBondage(en: entity, mode?: number): void;
    function KDFreeNPC(en: entity, rescue?: boolean): void;
    function KDFreeNPCID(id: number): void;
    let KDDrewEnemyTooltip: string;
    let KDDrewEnemyTooltipThisFrame: string;
    let KDCurrentEnemyTooltip: entity;
    function KDDrawEnemyTooltip(enemy: entity, offset: number, showExtra: boolean): number;
    function KDDrawEnemyDialogue(enemy: entity, offset: number): number;
    function KDGetColor(enemy: entity): string;
    let KDChampionMax: number;
    function KinkyDungeonCapture(enemy: entity): boolean;
    function KDDropStolenItems(enemy: entity, mapData?: KDMapDataType): void;
    function KDClearStolenItems(enemy: entity): void;
    function KDGetStolenItems(enemy: entity): string[];
    function KinkyDungeonEnemyCheckHP(enemy: entity, E: number, mapData: KDMapDataType): boolean;
    function KDCheckDespawn(enemy: entity, E: number, mapData: KDMapDataType): boolean;
    function KDDropItems(enemy: entity, mapData: KDMapDataType): void;
    function KDFavorNPC(Enemy: entity): boolean;
    function KDGetFavor(Enemy: entity): number;
    function KDChangeFavor(Enemy: entity, Amount: number): void;
    function KDAddFavor(Faction: string, Amount: number): void;
    function KDModFavor(Faction: string, Amount: number): void;
    function KinkyDungeonCheckLOS(enemy: entity, player: any, distance: number, maxdistance: number, allowBlind: boolean, allowBars: boolean, maxFails?: number): boolean;
    function KinkyDungeonTrackSneak(enemy: entity, delta: number, player: any, darkmult?: number): number;
    function KinkyDungeonCalcVisibility(player: any, darkmult?: number): number;
    function KinkyDungeonMultiplicativeStat(Stat: number): number;
    function KDBlockDodgeStat(Stat: number): number;
    function KDNearbyEnemies(x: number, y: number, dist: number, hostileEnemy?: entity, cheb?: boolean, nonhostileEnemy?: entity): entity[];
    function KDNearbyEntities(x: number, y: number, dist: number): entity[];
    function KDNearbyTiles(x: number, y: number, dist: number): {
        x: number;
        y: number;
        tile: any;
    }[];
    function KDNearbyMapTiles(x: number, y: number, dist: number): {
        x: number;
        y: number;
        tile: string;
    }[];
    function KDNearbyNeutrals(x: number, y: number, dist: number, neutralEnemy?: entity): entity[];
    function KinkyDungeonGetRandomEnemyPoint(avoidPlayer: boolean, onlyPlayer?: boolean, Enemy?: entity, playerDist?: number, minDist?: number, ignoreOL?: boolean, maxDist?: number): KDPoint;
    function KDGetNearestInterestingLabel(x: number, y: number, entity: entity, ignoreID: number, ignoreEntity: boolean, typeFilter?: string, maxDist?: number, _navigable?: boolean): KDLabel;
    function KDGetNearestGuardLabel(x: number, y: number, entity: entity, ignoreID: number, ignoreEntity: boolean, typeFilter?: string, maxDist?: number, _navigable?: boolean): KDLabel;
    let RandomPathList: any[];
    function KinkyDungeonGetRandomEnemyPointCriteria(criteria: (x: number, y: number) => boolean, avoidPlayer: boolean, onlyPlayer: boolean, Enemy?: entity, playerDist?: number, minDist?: number, ignoreOL?: boolean, maxDist?: number): KDPoint;
    function KinkyDungeonGetNearbyPoint(x: number, y: number, allowNearPlayer?: boolean, Enemy?: entity, Adjacent?: boolean, ignoreOL?: boolean, callback?: (x: number, y: number) => boolean, allowOrigin?: boolean, allowInsideEnemy?: boolean, mapData?: KDMapDataType): KDPoint;
    function KinkyDungeonTickFlagsEnemy(enemy: entity, delta: number): boolean;
    function KDTickFlagsRestraint(item: item | NPCRestraint, delta: number): boolean;
    let KinkyDungeonDamageTaken: boolean;
    let KinkyDungeonTorsoGrabCD: number;
    let KinkyDungeonHuntDownPlayer: boolean;
    function KinkyDungeonHasStatus(enemy: entity): boolean;
    function KinkyDungeonIsStunned(enemy: entity): boolean;
    function KinkyDungeonIsDisabled(enemy: entity): boolean;
    function KinkyDungeonIsSlowed(enemy: entity): boolean;
    function KinkyDungeonCanCastSpells(enemy: entity): boolean;
    interface KDMiscastEventData {
        enemy: entity;
        miscast: number;
        distractionbonus: number;
        silencebonus: number;
    }
    function KDGetEnemyMiscast(enemy: entity): number;
    function KDCanBind(enemy: entity): boolean;
    function KDBoundEffects(enemy: entity): number;
    function KDGetBindEffectMult(enemy: entity): number;
    function KinkyDungeonUpdateEnemies(maindelta: number, Allied: boolean): void;
    function KDRunDefeatForEnemy(): void;
    function KDRunRegularJailDefeatAttempt(CDE: entity, allowMain?: boolean, runBackup?: boolean): boolean;
    let KDCustomDefeat: string;
    let KDCustomDefeatEnemy: entity;
    function KDMakeHostile(enemy: entity, timer?: number): void;
    function KDCheckVulnerableBackstab(enemy: entity): boolean;
    function KDGetAI(enemy: entity): string;
    let KDThoughtBubbles: Map<number, {
        name: string;
        priority: number;
        duration: number;
        index: number;
    }>;
    function KDAddThought(id: number, name: string, priority: number, duration: number): void;
    function KDGetEnemyPlayLine(enemy: entity): string;
    function KDEnemyCanTalk(enemy: entity): boolean;
    let AIData: KDAIData;
    function KinkyDungeonEnemyLoop(enemy: entity, player: any, delta: number, visionMod: number, playerItems: item[]): {
        idle: boolean;
        defeat: boolean;
        defeatEnemy: entity;
    };
    function KinkyDungeonGetEnemyID(): number;
    function KinkyDungeonGetSpellID(): number;
    function KinkyDungeonGetItemID(): number;
    function KinkyDungeonGetRegimentID(): number;
    let KinkyDungeonEnemyID: number;
    let KinkyDungeonSpellID: number;
    function KinkyDungeonNoEnemy(x: number, y: number, Player?: boolean): boolean;
    function KDIsImmobile(enemy: entity, strict?: boolean): boolean;
    function KinkyDungeonCanSwapWith(e: entity, Enemy: entity): boolean;
    function KinkyDungeonNoEnemyExceptSub(x: number, y: number, Player: boolean, Enemy: entity, mapData?: KDMapDataType): boolean;
    function KinkyDungeonNoEnemyExceptID(x: number, y: number, Player: boolean, ID: number, mapData?: KDMapDataType): boolean;
    function KinkyDungeonEnemyAt(x: number, y: number, mapData?: KDMapDataType): entity;
    function KinkyDungeonEntityAt(x: number, y: number, requireVision?: boolean, vx?: number, vy?: number, player?: boolean, mapData?: KDMapDataType): entity;
    let KDDefaultEnemySprint: number;
    function KinkyDungeonEnemyTryMove(enemy: entity, Direction: {
        x: number;
        y: number;
        delta: number;
    }, delta: number, x: number, y: number, canSprint: boolean): boolean;
    function KinkyDungeonEnemyTryAttack(enemy: entity, player: any, Tiles: any, delta: number, _x: number, _y: number, points: number, _replace: any, _msgColor: any, _usingSpecial: boolean, refreshWarningTiles: boolean, attack: string, MovableTiles: string): boolean;
    type warningTileEntry = {
        color?: string;
        x: number;
        y: number;
        visual_x: number;
        visual_y: number;
        scale: number;
        x_orig?: number;
        y_orig?: number;
    };
    function KinkyDungeonGetWarningTilesAdj(enemy: entity): warningTileEntry[];
    function KDCanPickpocketPlayer(_player: entity): boolean;
    function KDCanPickpocket(enemy: entity): boolean;
    function KinkyDungeonGetWarningTiles(dx: number, dy: number, range: number, width: number, forwardOffset: number, enemy: entity): warningTileEntry[];
    function KinkyDungeonFindMaster(enemy: entity): {
        master: entity;
        dist: number;
        info: any;
    };
    function KinkyDungeonEnemyCanMove(enemy: entity, dir: {
        x: number;
        y: number;
        delta: number;
    }, MovableTiles: string, AvoidTiles: string, ignoreLocks: boolean, Tries: number): boolean;
    function KinkyDungeonFindID(id: number, mapData?: KDMapDataType): entity;
    function KDLookupID(id: number, allowPlayer?: boolean): entity;
    function KDDash(enemy: entity, player: entity, MovableTiles: string): {
        happened: number;
        Dash: boolean;
    };
    function KinkyDungeonSendEnemyEvent(Event: string, data: any, mapData: KDMapDataType): void;
    function KDGetIntentEvent(enemy: entity, data: any, play: boolean, allied: boolean, hostile: boolean, aggressive: boolean): (enemy: entity, aiData: KDAIData) => void;
    function KDGetDir(enemy: entity, target: any, func?: typeof KinkyDungeonGetDirectionRandom): {
        x: number;
        y: number;
        delta: number;
    };
    function KDPullResistance(enemy: entity): number;
    function KDPushModifier(power: number, enemy: entity, allowNeg?: boolean): number;
    function KDTieUpEnemy(enemy: entity, amount: number, type?: string, Damage?: any, Msg?: any, Delay?: any): any;
    function KDPredictStruggle(enemy: entity, struggleMod: number, delta: number, allowStruggleAlwaysThresh?: number): any;
    let KDDomThresh_Loose: number;
    let KDDomThresh_Normal: number;
    let KDDomThresh_Strict: number;
    let KDDomThresh_Variance: number;
    let KDDomThresh_PerkMod: number;
    function KDSetDomVariance(enemy: entity): void;
    function KDCanDom(enemy: entity, ignoreRelative?: boolean): boolean;
    function KDPlayerIsNotDom(): boolean;
    function KDPlayerIsTied(): boolean;
    function KDIsSubbyPersonality(entity: entity): boolean;
    function KDIsBrattyPersonality(entity: entity): boolean;
    function KDIsBrat(enemy: entity): boolean;
    function KDCaptureNearby(enemy: entity, noParty?: boolean): void;
    function KDCanCapturePartyMember(en: entity): boolean;
    function KinkyDungeonGetLoadoutForEnemy(enemy: entity, guaranteed: boolean): string;
    function KinkyDungeonGetTextForEnemy(key: string, enemy: entity, useName?: boolean): string;
    function KDPlayerIsDefeated(): number;
    function KDPlayerIsDisabled(): number | boolean;
    function KDPlayerIsStunned(): number | boolean;
    function KDPlayerIsImmobilized(): true | item;
    function KDPlayerIsSlowed(): number | boolean;
    function KDEnemyReallyAware(enemy: entity, player: any): boolean;
    function KDGetAwareTooltip(enemy: entity): {
        suff: string;
        color: string;
    };
    function KDProcessLock(lock: string): string;
    let KDDefaultRestraintThresh: number;
    function KDRestockRestraints(enemy: entity, restMult: number): void;
    function KDDetermineBaseRestCount(enemy: entity, restMult: number): number;
    function KDStockRestraints(enemy: entity, restMult: number, count?: number): void;
    function KDSetLoadout(enemy: entity, loadout: string): void;
    function KDClearItems(enemy: entity): void;
    function KDAddLostItemSingle(item: string, _quantity?: number): boolean;
    function KDCanDetect(enemy: entity, player: entity, allowBlind?: boolean): boolean;
    function KDGetSecurity(enemy: entity, type: string): number;
    function KDReduceBinding(enemy: entity, bonus: number): void;
    function KDPlayerDeservesPunishment(_enemy: entity, player: entity): boolean;
    function KDPlugEnemy(enemy: entity): void;
    function KDGetTags(enemy: entity, removeSpecial: boolean): Record<string, boolean>;
    function KDGetExtraTags(enemy: entity, useSpecial: boolean, useGlobalExtra: boolean): Record<string, number>;
    function KDRunBondageResist(enemy: entity, faction: string, restraintsToAdd: {
        r: restraint;
        v: ApplyVariant;
        iv: string;
    }[], blockFunction: (r?: any) => void, restraintFromInventory?: string[], spell?: spell, Lock?: string, Keep?: boolean): {
        r: restraint;
        v: ApplyVariant;
        iv: string;
    }[];
    function KDAssignLeashPoint(enemy: entity): KDJailPoint;
    function KDGetHighSecLoc(enemy: entity, fromHere?: boolean): KDPoint;
    function KDGetFallbackJailPoint(direction: number): {
        x: number;
        y: number;
    };
    function KDSelfishLeash(enemy: entity): boolean;
    function KDEnemyUnfriendlyToMainFaction(enemy: entity): boolean;
    function KDGetMainFaction(mapData?: KDMapDataType): string;
    function KDPlayerLeashed(player: entity): boolean;
    function KDPlayerLeashable(player: entity): boolean;
    function KDEnemyCanBeVibed(en: entity): boolean;
    function KDEnemySoundDecay(enemy: entity, delta: number): void;
    function KDDefaultSound(enemy: entity): number;
    function KDEnemyAddSound(enemy: entity, amount: number, novisual?: boolean, desc?: string, forcemult?: number): void;
    function KDCanHearEnemy(entity: entity, enemy: entity, mult?: number): boolean;
    function KDPlayerSound(entity: entity): number;
    function KDCanHearSound(entity: entity, sound: number, x: number, y: number, mult?: number): number;
    function KDPointWanderable(x: number, y: number, mapData?: KDMapDataType): boolean;
    function KDOverrideIgnore(enemy: entity, player: entity): boolean;
    function KDIsFlying(enemy: entity): boolean;
    function KDEnemyCanSignal(enemy: entity): boolean;
    function KDEnemyCanSignalMap(enemy: entity): boolean;
    function KDEnemyCanSignalOthers(enemy: entity): boolean;
    function KDGetDialogueTrigger(enemy: entity, Data: KDAITriggerData, requireTags?: string[]): string;
    function KDCanOverrideAI(enemy: entity): boolean;
    function KDGetAIOverride(enemy: entity, index: string): string;
    function KDGetAITypeOverride(Enemy: enemy, index: string): string;
    function KDMakeHighValue(enemy: entity): void;
    function KDGetSpecialBuffList(enemy: entity, types: string[]): Record<string, number>;
    function KDEnemyRank(enemy: entity): number;
    function KDEnemyTypeRank(enemy: enemy): number;
    function KDEnemyCanSprint(enemy: entity): boolean;
    function KDEnemyChangeSprint(enemy: entity, amt: number): void;
    let KDShopMoneyBase: number;
    let KDShopMoneyPerFloor: number;
    let KDShopMoneyPerRank: number;
    function KDSetShopMoney(enemy: entity, dontSet?: boolean): number;
    function KDIsInParty(enemy: entity): boolean;
    function KDIsInPartyID(id: number): boolean;
    function KDIsInCapturedParty(enemy: entity): boolean;
    function KDIsInCapturedPartyID(id: number): boolean;
    function KDGetPartyRefs(): entity[];
    function KDCapturedPartyMemberIsOnMap(_enemy: entity): entity;
    function KDAddToParty(enemy: entity): boolean;
    function KDAddToCapturedParty(enemy: entity): boolean;
    function KDRemoveFromParty(enemy: entity, capture: boolean): boolean;
    function KDRemoveFromPartyID(id: number, capture: boolean): boolean;
    function KDAddEntity(entity: entity, makepersistent?: boolean, dontteleportpersistent?: boolean, noLoadout?: boolean, mapData?: KDMapDataType): entity;
    function KDSpliceIndex(index: number, num?: number, mapData?: KDMapDataType): void;
    function KDDespawnEnemy(enemy: entity, E: number, mapData: KDMapDataType, moveThruExit?: string, moveToX?: number, moveToY?: number): boolean;
    function KDRemoveEntity(enemy: entity, kill?: boolean, capture?: boolean, noEvent?: boolean, forceIndex?: number, mapData?: KDMapDataType): boolean;
    function KDGetMaxBlock(entity: entity): number;
    function KDGetMaxDodge(entity: entity): number;
    function KDGetBaseBlock(entity: entity): number;
    function KDGetBaseDodge(entity: entity): number;
    function KDGetBlockAmount(entity: entity): number;
    function KDCanBlock(enemy: entity): boolean;
    function KDCanDodge(enemy: entity): boolean;
    function KDIsTimeImmune(enemy: entity): boolean;
    function KDAddDistraction(entity: entity, amt: number, desireMult?: number, noEvent?: boolean): number;
    function KDToughArmor(entity: entity): boolean;
    function KDAbsoluteArmor(entity: entity): boolean;
    function KDIsDisarmed(enemy: entity): boolean;
    function KDHasArms(enemy: entity): boolean;
    function KDPlayerFacingAway(player: any, enemy: entity): boolean;
    function KDGetTeaseAttack(enemy: entity, player: entity, AData: KDAIData): KDTeaseAttack;
    function KDBasicTeaseAttack(enemy: entity, player: entity, noglobal?: boolean): boolean;
    function KDGetVibeToys(enemy: entity): string[];
    function KDGetTeaseDamageMod(enemy: entity): number;
    function KDPlayerIsRestricted(player: any, enemy: entity): boolean;
    function KDGetUnassignedGuardTiles(type?: string, ignoreNegative?: boolean): any[];
    function KDCanIdleFidget(enemy: entity): boolean;
    function KDRescueRepGain(en: entity): void;
    function KDRescueEnemy(rescueType: string, en: entity, makePlayer?: boolean): boolean;
    function KDGetEnemyTypeName(enemy: entity): string;
    function KDGateAttack(enemy: entity, AID?: KDAIData): boolean;
    function KDAcceptsLeash(enemy: entity, _leash: KDLeashData): boolean;
    function KDEnemyAccuracy(enemy: entity, player: entity): number;
    function KDIsDistracted(enemy: entity): boolean;
    function KDEnemyRelease(Enemy: entity): boolean;
    function KDBlockedByPlayer(enemy: entity, dir: {
        x: number;
        y: number;
        delta: number;
    }): void;
    function KDEnemyStruggleTurn(enemy: entity, delta: number, allowStruggleAlwaysThresh?: number, force?: boolean, defaultSpeed?: boolean): void;
    function KDGetEnemyWillReward(enemy: entity): number;
    function KDGetEnemyRep(enemy: entity): number;
    function KDGetEnemyTypeRep(enemy: enemy, faction: string): number;
    function GetOutfitMetadata(value: KDCollectionEntry | KDPersistentNPC | Character): KDOutfitMetadata;
    function KDQuickGenNPC(enemy: entity, force: boolean): void;
    function KDPlayPossible(enemy: entity): boolean;
    function KDCanApplyBondage(target: entity, player: entity, extraCondition?: (t: entity, p: entity) => boolean): boolean;
    function KDWillingBondage(target: entity, player: entity): boolean;
    function KDIsSubmissive(entity: entity, threshold?: number): boolean;
    function KDGetCapturingNPC(enemy: entity, dist?: number): entity;
    function KDEntityAtRiskOfCapture(enemy: entity, mapData: KDMapDataType): boolean;
    function KDGetEntityMaxDistraction(entity: entity): number;
    function KDGetDistraction(entity: entity): number;
    function KDIsNearbyFurniture(enemy: entity, dist: number): boolean;
    function KDWanderFarEnemyParty(enemy: entity): boolean;
    function KDApplyBindStun(enemy: entity, amount: number): number;
    let KDBindStunDecayHPFactor: number;
    let KDBindStunDecayHPFactorExp: number;
    let KDBindStunDecayMaxHPFactor: number;
    let KDBindStunCurrentStunFactor: number;
    let KDBindStunDecayMaxHPFactorExp: number;
    function KDEnemyDecayBindStun(enemy: entity, delta: number): void;
    function KDDoSlow(player: entity, amt: number): void;
    function KDResetMoveFlags(enemy: entity): void;
    function KDGetCoordFromMapData(mapData: KDMapDataType): WorldCoord;
    let KDJailPersonalities: {
        Robot: boolean;
        Dom: boolean;
        Sub: boolean;
    };
    let KDStrictPersonalities: string[];
    let KDLoosePersonalities: string[];
    let KDEnemyPersonalities: {
        "": {
            weight: number;
            loose: boolean;
            strict: boolean;
            brat: boolean;
            domVariance: number;
            submissiveness: number;
            tags: {
                robot: number;
                switch: number;
                veryswitch: number;
                nobrain: number;
            };
        };
        Robot: {
            weight: number;
            loose: boolean;
            strict: boolean;
            brat: boolean;
            submissiveness: number;
            tags: {
                robot: number;
                cyborg: number;
                nobrain: number;
            };
        };
        NoBrain: {
            weight: number;
            loose: boolean;
            strict: boolean;
            brat: boolean;
            submissiveness: number;
            tags: {
                nobrain: number;
            };
        };
        Dom: {
            weight: number;
            loose: boolean;
            strict: boolean;
            brat: boolean;
            submissiveness: number;
            tags: {
                minor: number;
                alchemist: number;
                elite: number;
                boss: number;
                robot: number;
                cyborg: number;
                submissive: number;
                dom: number;
                verydom: number;
                nobrain: number;
            };
        };
        Sub: {
            weight: number;
            loose: boolean;
            strict: boolean;
            brat: boolean;
            submissiveness: number;
            tags: {
                minor: number;
                human: number;
                elite: number;
                boss: number;
                robot: number;
                cyborg: number;
                submissive: number;
                sub: number;
                verysub: number;
                nobrain: number;
            };
        };
        Brat: {
            weight: number;
            loose: boolean;
            strict: boolean;
            brat: boolean;
            domMod: number;
            domVariance: number;
            submissiveness: number;
            tags: {
                minor: number;
                brat: number;
                verybrat: number;
                human: number;
                boss: number;
                robot: number;
                nobrain: number;
                cyborg: number;
                submissive: number;
            };
        };
    };
    function KDGetPersonality(enemy: entity): string;
    function KDGetPersonalityType(Enemy: enemy): string;
    function KDJailPersonality(enemy: entity): string;
    let KDNoCaptureTypes: string[];
    let KinkyDungeonEnemies: enemy[];
    let KDOndeath: Record<string, (enemy: entity, o: any, mapData: KDMapDataType) => void>;
    let KDSpecialConditions: Record<string, SpecialCondition>;
    let KDSpecialBuffs: Record<string, KDSpecialEnemyBuff>;
    function KDEndEnemyAction(enemy: entity): void;
    function KDMaintainEnemyAction(enemy: entity, delta: number): void;
    let KDEnemyAction: Record<string, KDEnemyActionType>;
    let SpecialPersistentScriptSettingList: Record<string, (npc: KDPersistentNPC, enemy: enemy) => string>;
    let SpawnAISettingList: Record<string, (npc: KDPersistentNPC, enemy: enemy) => string>;
    let WanderAISettingList: Record<string, (npc: KDPersistentNPC, enemy: enemy) => string>;
    let KDIntentEvents: Record<string, EnemyEvent>;
    function KDResetIntent(enemy: entity, _aiData?: KDAIData): void;
    function KDSettlePlayerInFurniture(enemy: entity, _aiData: KDAIData, tags?: string[], guardDelay?: number, ftype?: string[]): boolean;
    function KDTryToLeash(enemy: entity, player: entity, delta: number, instant?: boolean, atkOnly?: boolean): void;
    function KDAttachLeashOrCollar(enemy: entity, player: entity, delta?: number, instant?: boolean, atkOnly?: boolean): void;
    function KDApplyFurnitureRestraint(x: number, y: number, player: entity): boolean;
    let KDTeaseAttackLists: KDTeaseAttackListsType;
    let KDTeaseAttacks: KDTeaseAttacksType;
    interface KinkyDungeonEscapeType {
        selectValid: boolean;
        requireMaxQuests?: boolean;
        filterRandom?: (roomType: string, mapMod: string, level: number, faction: string) => number;
        check: () => boolean;
        minimaptext: () => string;
        doortext: () => string;
        worldgenstart?: () => void;
    }
    let KinkyDungeonEscapeTypes: Record<string, KinkyDungeonEscapeType>;
    function KDEscapeWorldgenStart(method: string): void;
    let KDCurseUnlockList: {
        Common: string[];
        Dragon: string[];
        Divine: string[];
        CursedCollar: string[];
        CursedCollar2: string[];
        LatexKittyCurse: string[];
    };
    let KDCurses: Record<string, KDCursedDef>;
    let KDCursedVars: Record<string, KDCursedVar>;
    function KDBestowCurse(item: item, ev: KinkyDungeonEvent[]): void;
    function KDSetCurse(item: item, curse: string, force?: boolean): boolean;
    function KDAddEventVariant(restraint: restraint, newRestraintName: string, ev: KinkyDungeonEvent[], power?: number, lock?: string, enemyTags?: Record<string, number>, noPick?: boolean): any;
    function KinkyDungeonCurseInfo(item: item, Curse: string): void;
    function KinkyDungeonCurseStruggle(item: item, Curse: string): void;
    function KinkyDungeonCurseAvailable(item: item, Curse: string): boolean;
    function KinkyDungeonCurseUnlock(group: string, index: number, Curse: string): void;
    function KDCursePower(curse: string): number;
    function KDCurseMult(curse: string): number;
    type KDSkimpyReplacer = (ret: any, restraint: restraint, newRestraintName: string) => any;
    let KDSkimpyModelReplace: Record<string, KDSkimpyReplacer>;
    let KDRopeMapByGroup: {
        ItemTorso: string;
        ItemPelvis: string;
        ItemLegs: string;
        ItemArms: string;
        ItemBreast: string;
    };
    let KDCutAdditionalLimitChance: number;
    let KDAllyLimitChanceRedMult: number;
    let KDAllyLimitChanceRedFlat: number;
    let KDAngelStruggleBonus: {
        Struggle: number;
        Cut: number;
        Remove: number;
        Unlock: number;
        Default: number;
    };
    let KDWillEscapePenalty: number;
    let KDWillEscapePenaltyArms: number;
    let KDWillEscapePenaltyStart: number;
    let KDWillEscapePenaltyStartArms: number;
    let KDWillEscapePenaltyEnd: number;
    let KDMinEscapeRate: number;
    let KDMinPickRate: number;
    let KDStruggleTime: number;
    let KDBaseEscapeSpeed: number;
    let KDUpfrontWill: boolean;
    let StruggleTypeHandThresh: {
        Struggle: number;
        Unlock: number;
        Pick: number;
        Cut: number;
        Remove: number;
    };
    let InvFilterShrineBlacklist: string[];
    let KDRestraintArchetypes: string[];
    let KDCustomAffinity: Record<string, (data: KDEventData_affinity) => boolean>;
    function KDGetTightnessEffect(escapeChance: number, struggleType: string, T?: number): number;
    function KDRestraintPowerMult(player: entity, restraint: restraint, augmentedInventory: string[]): number;
    function KDGetWillPenalty(StruggleType: string): number;
    let KinkyDungeonCurrentEscapingItem: any;
    let KinkyDungeonCurrentEscapingMethod: any;
    let KinkyDungeonStruggleTime: number;
    let KinkyDungeonMultiplayerInventoryFlag: boolean;
    let KinkyDungeonItemDropChanceArmsBound: number;
    let KinkyDungeonKeyJamChance: number;
    let KinkyDungeonKeyPickBreakAmount: number;
    let KinkyDungeonKeyPickBreakAmountBase: number;
    let KinkyDungeonPickBreakProgress: number;
    let KinkyDungeonKnifeBreakAmount: number;
    let KinkyDungeonKnifeBreakAmountBase: number;
    let KinkyDungeonKnifeBreakProgress: number;
    let KinkyDungeonEnchKnifeBreakAmount: number;
    let KinkyDungeonEnchKnifeBreakAmountBase: number;
    let KinkyDungeonEnchKnifeBreakProgress: number;
    let KinkyDungeonMaxImpossibleAttempts: number;
    let KinkyDungeonEnchantedKnifeBonus: number;
    let KDLocksmithPickBonus: number;
    let KDLocksmithBonus: number;
    let KDLocksmithSpeedBonus: number;
    let KDCluelessPickBonus: number;
    let KDCluelessBonus: number;
    let KDCluelessSpeedBonus: number;
    let KDFlexibleBonus: number;
    let KDFlexibleSpeedBonus: number;
    let KDInflexibleMult: number;
    let KDInflexibleSpeedBonus: number;
    let KDUnchainedBonus: number;
    let KDDamselBonus: number;
    let KDDamselPickAmount: number;
    let KDArtistBonus: number;
    let KDBunnyBonus: number;
    let KDBunnyKnifeAmount: number;
    let KDBunnyEnchKnifeAmount: number;
    let KDSlipperyBonus: number;
    let KDDollBonus: number;
    let KDEscapeeBonus: number;
    let KDDragonBonus: number;
    let KDStrongBonus: number;
    let KDWeakBonus: number;
    let KDBondageLoverAmount: number;
    let KinkyDungeonRestraintsCache: Map<string, restraint>;
    function KDRestraint(item: Named): restraint;
    function KDRestraintBondageMult(item: Named, target: entity): number;
    function KDRestraintBondageType(item: Named): string;
    function KDRestraintBondageConditions(item: Named): string[];
    function KDRestraintBondageStatus(item: Named): KDBondageStatus;
    function KDItemIsMagic(item: item): boolean;
    const KinkyDungeonStrictnessTable: Map<string, string[]>;
    let KDProgressiveOrder: {};
    function KDGetProgressiveOrderFun(): any;
    let KDRestraintsCache: Map<string, {
        r: restraint;
        w: number;
    }[]>;
    let KDTetherGraphics: any;
    let KDGameBoardAddedTethers: boolean;
    function KinkyDungeonKeyGetPickBreakChance(modifier?: number): number;
    function KinkyDungeonGetKnifeBreakChance(modifier?: number): number;
    function KinkyDungeonGetEnchKnifeBreakChance(modifier: number): number;
    function KinkyDungeonIsLockable(restraint: restraint): boolean;
    function KinkyDungeonLock(item: item, lock: string, NoEvent?: boolean, Link?: boolean, pick?: boolean, normalUnlock?: boolean, remover?: entity): void;
    function KDGetCurse(item: item): string;
    function KDIsBinding(item: item): boolean;
    function KinkyDungeonSingleRestraintMatchesShrine(item: item, shrine: string, ignoreGold: boolean, ignoreShrine: boolean, forceIgnoreNonBinding: boolean): boolean;
    function KinkyDungeonAllowTagMatch(item: item, ignoreGold: boolean, ignoreShrine: boolean, forceIgnoreNonBinding: boolean): boolean;
    function KinkyDungeonCurseOrItemAllowMatch(item: item, ignoreShrine: boolean): boolean;
    function KinkyDungeonLockAllowMatch(item: item, ignoreGold: boolean): boolean;
    function KinkyDungeonGetRestraintsWithShrine(shrine: string, ignoreGold?: boolean, recursive?: boolean, ignoreShrine?: boolean, forceIgnoreNonBinding?: boolean, ignoreFavorite?: boolean): item[];
    function KinkyDungeonRemoveRestraintsWithShrine(shrine: string, maxCount?: number, recursive?: boolean, noPlayer?: boolean, ignoreGold?: boolean, ignoreShrine?: boolean, Keep?: boolean, forceIgnoreNonBinding?: boolean, forceFavorite?: boolean): number;
    function KDRemoveThisItem(item: item, Keep?: boolean, NoEvent?: boolean, Shrine?: boolean, Remover?: entity, ForceRemove?: boolean): void;
    function KinkyDungeonRemoveRestraintsWithName(name: string): number;
    function KinkyDungeonUnlockRestraintsWithShrine(shrine: string): number;
    function KinkyDungeonPlayerGetLockableRestraints(): item[];
    function KinkyDungeonPlayerGetRestraintsWithLocks(Locks: string[], recursive?: boolean): item[];
    function KinkyDungeonRemoveKeysUnlock(lock: string): void;
    function KinkyDungeonRemoveKeysDropped(lock: string, keytype: string): void;
    function KinkyDungeonGetKey(lock: string): string;
    function KinkyDungeonHasGhostHelp(): boolean;
    function KinkyDungeonHasHelp(): boolean;
    function KinkyDungeonHasAllyHelp(): boolean;
    function KinkyDungeonHasAngelHelp(): boolean;
    function KinkyDungeonIsWearingLeash(): boolean;
    let KDAffinityList: string[];
    function KinkyDungeonGetAffinity(Message: boolean, affinity: string, group?: string, entity?: entity): boolean;
    function KinkyDungeonWallCrackAndKnife(Message: boolean): boolean;
    function KDIsItemAccessible(item: item): boolean;
    function KDIsTreeAccessible(item: item): boolean;
    function KDIsTreeChastity(item: item): boolean;
    function KDIsTreeChastityBra(item: item): boolean;
    function KDGroupBlocked(Group: string, _External?: boolean): boolean;
    function KDGetBlockingRestraints(Group: string, _External?: boolean): item[];
    function KDGetBlockingSecurity(Group: string, External: boolean): item[];
    function KinkyDungeonCanUseKey(Other?: boolean): boolean;
    function KinkyDungeonIsHandsBound(ApplyGhost?: boolean, Other?: boolean, Threshold?: number, group?: string, NoEvent?: boolean, query?: boolean): boolean;
    function KinkyDungeonIsHandsBoundFast(ApplyGhost?: boolean, Other?: boolean, group?: string, NoEvent?: boolean, query?: boolean): boolean;
    function KDHandBondageTotal(Other?: boolean): number;
    function KinkyDungeonCanUseFeet(bootsPrevent?: boolean, group?: string): boolean;
    function KinkyDungeonCanUseFeetLoose(bootsPrevent?: boolean): boolean;
    function KinkyDungeonIsArmsBound(ApplyGhost?: boolean, Other?: boolean, group?: string, NoEvent?: boolean, query?: boolean): boolean;
    function KinkyDungeonIsArmsBoundFast(ApplyGhost?: boolean, Other?: boolean, group?: string, NoEvent?: boolean, query?: boolean): boolean;
    interface ArmsBoundData {
        hasHelp: boolean;
        query: boolean;
        C: Character;
        ApplyGhost: boolean;
        Other: boolean;
        group: string;
        forceResult: any;
        forceResultPower: number;
        fast?: boolean;
    }
    interface HandsBoundData {
        hasHelp: boolean;
        query: boolean;
        C: Character;
        ApplyGhost: boolean;
        Other: boolean;
        group: string;
        forceResult: any;
        forceResultPower: number;
        fast?: boolean;
    }
    function KinkyDungeonIsArmsBoundC(C: Character, ApplyGhost?: boolean, Other?: boolean, group?: string, NoEvent?: boolean, query?: boolean): boolean;
    function KinkyDungeonStrictness(ApplyGhost: boolean, Group: string, excludeItem?: item): number;
    function KinkyDungeonGetStrictnessItems(Group: string, excludeItem: item): string[];
    function KinkyDungeonGetPickBaseChance(): number;
    function KinkyDungeonGetPickBonus(): number;
    function KinkyDungeonPickAttempt(): boolean;
    function KinkyDungeonUnlockAttempt(lock: string): boolean;
    function KDGetRestraintAffinity(item: item, data: any): string;
    function KDGetEscapeChance(restraint: item, StruggleType: string, escapeChancePre: number, limitChancePre: number, ApplyGhost: boolean, ApplyPlayerBonus: boolean, Msg?: boolean): {
        escapeChance: any;
        limitChance: any;
        escapeChanceData: {
            restraint: item;
            escapeChance: any;
            limitChance: any;
            struggleType: string;
            escapeChancePre: number;
            limitChancePre: number;
            ApplyGhost: boolean;
            ApplyPlayerBonus: boolean;
            GoddessBonus: number;
            Msg: boolean;
        };
    };
    let KDUnboundAffinityOverride: {
        Sticky: boolean;
        Edge: boolean;
        Hook: boolean;
    };
    function KDGetDynamicItem(group: string, index: number): {
        restraint: item;
        host: item;
    };
    function KDGetStruggleData(data: KDStruggleData): string;
    function KinkyDungeonStruggle(struggleGroup: string, StruggleType: string, index: number, query?: boolean, retData?: KDStruggleData): string;
    function KinkyDungeonGetRestraintItem(group: string, index?: number): item;
    function KinkyDungeonRefreshRestraintsCache(): void;
    function KinkyDungeonGetRestraintByName(Name: string): restraint;
    function KinkyDungeonGetLockMult(Lock: string, item?: item, curse?: string, restraint?: restraint): number;
    let KDHeavyRestraintPrefs: string[];
    let KDNoOverrideTags: string[];
    type eligibleRestraintOptions = {
        dontAugmentWeight?: boolean;
        ApplyVariants?: boolean;
        dontPreferVariant?: boolean;
        allowLowPower?: boolean;
        ForceDeep?: boolean;
        noOverpower?: boolean;
        extraOptions?: string[];
        inventoryWeight?: number;
        QuitOnFirst?: boolean;
        willBonus?: number;
        suppressTightPerk?: boolean;
    };
    type eligibleRestraintItem = {
        restraint: restraint;
        variant?: ApplyVariant;
        weight: number;
        inventoryVariant?: string;
    };
    function KDGetWillPercent(applier: entity, penalty?: number): number;
    let geteligrest_lastTagsEnemy: KDHasTags;
    let geteligrest_lastIgnoreTags: string[];
    let geteligrest_lastExtraTags: Record<string, number>;
    let geteligrest_lastTags: Map<string, boolean>;
    function KDGeteligrest_gettags(effLevel: number, enemy: KDHasTags, ignoreTags: string[], extraTags: Record<string, number>): Map<string, boolean>;
    function KDGetRestraintsEligible(enemy: KDHasTags, Level: number, Index: string, Bypass: boolean, Lock: string, RequireWill?: boolean, LeashingOnly?: boolean, NoStack?: boolean, extraTags?: Record<string, number>, agnostic?: boolean, filter?: {
        filterGroups?: string[];
        minPower?: number;
        maxPower?: number;
        onlyLimited?: boolean;
        noUnlimited?: boolean;
        noLimited?: boolean;
        onlyUnlimited?: boolean;
        ignore?: string[];
        require?: string[];
        looseLimit?: boolean;
        ignoreTags?: string[];
        allowedGroups?: string[];
        currentWill?: number;
    }, securityEnemy?: entity, curse?: string, filterEps?: number, minWeightFallback?: boolean, useAugmented?: boolean, augmentedInventory?: string[], options?: eligibleRestraintOptions): eligibleRestraintItem[];
    function KinkyDungeonGetRestraint(enemy: KDHasTags, Level: number, Index: string, Bypass?: boolean, Lock?: string, RequireWill?: boolean, LeashingOnly?: boolean, NoStack?: boolean, extraTags?: Record<string, number>, agnostic?: boolean, filter?: {
        filterGroups?: string[];
        minPower?: number;
        maxPower?: number;
        onlyLimited?: boolean;
        noUnlimited?: boolean;
        noLimited?: boolean;
        onlyUnlimited?: boolean;
        ignore?: string[];
        require?: string[];
        looseLimit?: boolean;
        ignoreTags?: string[];
        allowedGroups?: string[];
        currentWill?: number;
    }, securityEnemy?: entity, curse?: string, useAugmented?: boolean, augmentedInventory?: string[], options?: eligibleRestraintOptions): any;
    function KDGetRestraintWithVariants(enemy: KDHasTags, Level: number, Index: string, Bypass: boolean, Lock: string, RequireWill: boolean, LeashingOnly?: boolean, NoStack?: boolean, extraTags?: Record<string, number>, agnostic?: boolean, filter?: {
        filterGroups?: string[];
        minPower?: number;
        maxPower?: number;
        onlyLimited?: boolean;
        noUnlimited?: boolean;
        noLimited?: boolean;
        onlyUnlimited?: boolean;
        ignore?: string[];
        require?: string[];
        looseLimit?: boolean;
        ignoreTags?: string[];
        allowedGroups?: string[];
    }, securityEnemy?: entity, curse?: string, useAugmented?: boolean, augmentedInventory?: string[], options?: eligibleRestraintOptions): {
        r: restraint;
        v: ApplyVariant;
        iv: string;
    };
    function KinkyDungeonUpdateRestraints(C?: Character, id?: number, _delta?: number, customRestraints?: item[], extraTags?: string[]): Map<string, boolean>;
    function KDGetNPCRestraintTags(restraintList: Record<string, NPCRestraint>, extraTags?: string[], id?: number, addTags?: boolean, events?: boolean): Map<string, boolean>;
    function KDGetCursePower(item: item): number;
    function KDGetVariantPower(item: item): number;
    function KinkyDungeonRestraintPower(item: item, NoLink?: boolean, toLink?: restraint, newLock?: string, newCurse?: string): number;
    function KinkyDungeonLinkableAndStricter(oldRestraint: restraint, newRestraint: restraint, item?: item, Lock?: string, Curse?: string, ignoreItem?: item, power?: number): boolean;
    function KDIsEligible(restraint: restraint): boolean;
    function KinkyDungeonGenerateRestraintTrap(): string;
    function KDGetLockVisual(item: item): string;
    function KDCanAddRestraint(restraint: restraint, Bypass: boolean, Lock: string, NoStack: boolean, r?: item, Deep?: boolean, noOverpower?: boolean, securityEnemy?: entity, useAugmentedPower?: boolean, curse?: string, augmentedInventory?: string[], powerBonus?: number): boolean;
    function KDEnemyPassesSecurity(Group: string, enemy: entity): boolean;
    function KDGetLinkUnder(currentRestraint: item, restraint: restraint, bypass?: boolean, NoStack?: boolean, Deep?: boolean, securityEnemy?: entity, Lock?: string, Curse?: string, powerBonus?: number, allowOverride?: boolean): item;
    function KDCanLinkUnder(currentRestraint: item, restraint: restraint, bypass?: boolean, NoStack?: boolean, securityEnemy?: entity, Lock?: string, Curse?: string, ignoreItem?: item, powerBonus?: number, allowOverride?: boolean): boolean;
    function KDCurrentItemLinkable(currentItem: item, newItem: restraint): boolean;
    function KDCheckLinkSize(currentRestraint: item, restraint: restraint, bypass?: boolean, NoStack?: boolean, _securityEnemy?: entity, ignoreItem?: item, props?: any, power?: number): boolean;
    function KDApplyVarToInvVar(restraint: restraint, variant: ApplyVariant): KDRestraintVariant;
    function KDLinkUnder(restraint: restraint, Tightness?: number, Bypass?: boolean, Lock?: string, Keep?: boolean, _Trapped?: boolean, events?: KinkyDungeonEvent[], faction?: string, Deep?: boolean, Curse?: string, securityEnemy?: entity, _reserved?: boolean, inventoryAs?: string, data?: Record<string, any>, powerBonus?: number, noOverpower?: boolean): number;
    function KinkyDungeonAddRestraintIfWeaker(restraint: restraint | string, Tightness?: number, Bypass?: boolean, Lock?: string, Keep?: boolean, Trapped?: boolean, events?: KinkyDungeonEvent[], faction?: string, Deep?: boolean, Curse?: string, securityEnemy?: entity, useAugmentedPower?: boolean, inventoryAs?: string, data?: Record<string, any>, augmentedInventory?: string[], variant?: ApplyVariant, powerBonus?: number, NoActionPrune?: boolean, options?: eligibleRestraintOptions): number;
    function KinkyDungeonIsLinkable(data: any): boolean;
    function KDCheckLinkTotal(oldRestraint: item, newRestraint: restraint, linkUnderHost?: item, _lock?: string, _curse?: string, _useAugmentedPower?: boolean, _augmentedInventory?: any): boolean;
    function KDUpdateLinkCaches(restraint: item): void;
    function KDGetLinkCache(restraint: item): string[];
    let KinkyDungeonRestraintAdded: boolean;
    let KinkyDungeonCancelFlag: boolean;
    function KinkyDungeonAddRestraint(restraint: restraint, Tightness: number, Bypass?: boolean, Lock?: string, Keep?: boolean, Link?: boolean, SwitchItems?: boolean, events?: KinkyDungeonEvent[], faction?: string, Unlink?: boolean, dynamicLink?: item, Curse?: string, autoMessage?: boolean, securityEnemy?: entity, inventoryAs?: string, data?: Record<string, number>, powerBonus?: number, NoEvent?: boolean, ForceRemove?: boolean, NoActionPrune?: boolean, flags?: Record<string, number>): number;
    function KinkyDungeonRemoveRestraintSpecific(item: item, Keep?: boolean, Add?: boolean, NoEvent?: boolean, Shrine?: boolean, UnLink?: boolean, Remover?: entity, ForceRemove?: boolean): item[];
    function KinkyDungeonRemoveRestraint(Group: string, Keep?: boolean, Add?: boolean, NoEvent?: boolean, Shrine?: boolean, UnLink?: boolean, Remover?: entity, ForceRemove?: boolean): item[];
    function KDIInsertRestraintUnderneath(_restraint: restraint): boolean;
    function KinkyDungeonRemoveDynamicRestraint(hostItem: item, Keep?: boolean, NoEvent?: boolean, Remover?: entity, ForceRemove?: boolean): item[];
    function KinkyDungeonRestraintTypes(ShrineFilter: string[]): string[];
    function KinkyDungeonLinkItem(newRestraint: restraint, oldItem: item, tightness: number, Lock?: string, Keep?: boolean, faction?: string, Curse?: string, autoMessage?: boolean, inventoryAs?: string, events?: KinkyDungeonEvent[], data?: Record<string, number>): item;
    function KinkyDungeonUnLinkItem(item: item, Keep: boolean, _dynamic?: any, ForceRemove?: boolean): item[];
    function KDCreateDebris(x: number, y: number, options: {
        aoe: number;
        number: number;
        dist: number;
        kind: string;
        duration?: number;
        durationExtra?: number;
    }): void;
    function KDSuccessRemove(StruggleType: string, restraint: item, lockType: KDLockType, index: number, data: any, host: item): boolean;
    function KDPruneSameStruggleActions(list: KDDelayedAction[], group: string, index: number): KDDelayedAction[];
    function KDAddDelayedStruggle(amount: number, time: number, _StruggleType: string, struggleGroup: string, index: number, data: KDStruggleData, progress?: number, limit?: number): void;
    function KDGetManaBonus(bonus: number, penalty: number, threshold: number, bonusscale: number, penaltyscale: number): number;
    function KDGetItemGoddessBonus(item: item, data?: any): number;
    function KDChooseRestraintFromListGroupPri(RestraintList: {
        restraint: restraint;
        weight: number;
    }[], GroupOrder: string[], skip?: boolean): restraint;
    function KDChooseRestraintFromListGroupPriWithVariants(RestraintList: eligibleRestraintItem[], GroupOrder: string[], skip?: boolean): {
        r: restraint;
        v: ApplyVariant;
        iv: string;
    };
    type kdRopeSlimePart = {
        enemyTagSuffix?: string;
        enemyTagSuffix2?: string;
        enemyTagExtra?: Record<string, number>;
    };
    let KDSlimeParts: Record<string, kdRopeSlimePart>;
    let KDRopeParts: Record<string, kdRopeSlimePart>;
    type kdCuffPart = {
        base: boolean;
        enemyTagSuffix?: string;
        enemyTagOverride?: Record<string, number>;
        Link?: string;
        UnLink?: string;
        ModelSuffix?: string;
    };
    let KDCuffParts: Record<string, kdCuffPart>;
    function KDAddCuffVariants(CopyOf: string, idSuffix: string, ModelSuffix: string, tagBase: string, extraTags: Record<string, number>, allTag: string[], removeTag: string[], addPower: number, properties: KDRestraintPropsBase, extraEvents?: KinkyDungeonEvent[], addStruggle?: KDEscapeChanceList, premultStruggle?: KDEscapeChanceList, addStruggleLink?: KDEscapeChanceList, premultStruggleLink?: KDEscapeChanceList, Filters?: Record<string, LayerFilter>, baseWeight?: number, noGeneric?: boolean, CuffAssets?: Record<string, string>, CuffModels?: Record<string, string>, noLockBase?: boolean, noLockLink?: boolean, Properties?: Record<string, LayerPropertiesType>, ExtraProps?: Record<string, KDRestraintPropsBase>): void;
    function KDAddRopeVariants(CopyOf: string, idSuffix: string, ModelSuffix: string, tagBase: string, allTag: string[], removeTag: string[], basePower: number, properties: KDRestraintPropsBase, extraEvents: KinkyDungeonEvent[], addStruggle: KDEscapeChanceList, premultStruggle: KDEscapeChanceList, Filters: Record<string, LayerFilter>, baseWeight?: number, Enchantable?: boolean, Properties?: Record<string, LayerPropertiesType>): void;
    function KDAddHardSlimeVariants(CopyOf: string, idSuffix: string, ModelSuffix: string, tagBase: string, allTag: string[], removeTag: string[], basePower: number, properties: KDRestraintPropsBase, extraEvents?: KinkyDungeonEvent[], addStruggle?: KDEscapeChanceList, premultStruggle?: KDEscapeChanceList, Filters?: Record<string, LayerFilter>, baseWeight?: number, restraintType?: string, Properties?: Record<string, LayerPropertiesType>): void;
    function KDGetRestraintTags(restraint: restraint): string[];
    function KDItemDataQuery(item: item, name: string): any;
    function KDItemDataSet(item: item, name: string, value: number | string): void;
    function KDItemFlagQuery(item: item, name: string): any;
    function KDItemFlagSet(item: item, name: string, value: number): void;
    function KDChangeItemName(item: item, type: string, name: string): void;
    function KDChangeRestraintType(item: item, type: string, name: string): void;
    function KDChangeNPCRestraint(inv: NPCRestraint, newRes: string): NPCRestraint;
    function KDCurseCount(activatedOnly: boolean): number;
    function KDGetTotalRestraintPower(_player: entity, requireSingleTag: string[], requireAllTags: string[], ignoregold: boolean, ignoreShrine: boolean, forceIgnoreNonBinding?: boolean, forceFavorite?: boolean): number;
    function KDGetEscapeSFX(restraint: Named): {
        Struggle?: string;
        Cut?: string;
        Remove?: string;
        Pick?: string;
        Unlock?: string;
        NoStamina?: string;
        NoWill?: string;
        NoMagic?: string;
        MagicCut?: string;
        PickBreak?: string;
        KnifeBreak?: string;
        KnifeDrop?: string;
        KeyDrop?: string;
        PickDrop?: string;
        Blocked?: string;
    };
    function KDGetRestraintSFX(restraint: Named): string;
    function KDGetFinishEscapeSFX(restraint: Named): {
        Struggle?: string;
        Cut?: string;
        Remove?: string;
        Pick?: string;
        Unlock?: string;
        Destroy?: string;
    };
    function KDGetRemoveSFX(restraint: Named): string;
    function KDHasRemovableCurse(item: item, level: number): boolean;
    function KDHasRemovableHex(item: item, level: number): boolean;
    function KDGetRemovableHex(item: item, level: number): KinkyDungeonEvent[];
    let KDRestraintDebugLog: any[];
    function KDGetItemName(item: item, type?: string, variant?: any): string;
    function KDGetRestraintName(restraint: restraint, variant?: ApplyVariant): string;
    function KDGetConsumableName(consumable: consumable, variant?: ApplyVariant): string;
    function KDGetWeaponName(weapon: weapon, variant?: ApplyVariant): string;
    function KDGetItemNameString(name: string): string;
    function KDGetEventsForRestraint(name: string): KinkyDungeonEvent[];
    function KDDynamicLinkList(item: item, includeItem?: boolean): item[];
    function KDDynamicLinkListSurface(item: item): item[];
    function KDLinkSize(restraint: restraint, index?: number): number;
    function KDLinkCategorySize(item: item, linkCategory: string, ignoreItem?: item, power?: number): number;
    function KDGetRestraintHost(item: item): item;
    function KDLinkItemEvent(e: KinkyDungeonEvent, item: item, data: any): void;
    function KDGetRestriction(): number;
    function KDAlwaysKeep(item: item, Remover: entity): boolean;
    function KDResortRestraints(Group: string, addedItem: item, bypass: boolean, securityEnemy: entity): void;
    function KDLockoutChance(player: entity): number;
    function KDLockoutGain(player: entity, data: any, base?: number): void;
    function KDMaxCutDepth(threshold: number, cutBonus: number, origEscapeChance: number, origLimitChance: number): number;
    function KDMaxStrugglePct(threshold: number, escapeChance: number, limitChance: number): number;
    function KDGetNecklaceGagType(player: entity): string;
    function KDAddFurnitureRestraintSet(entity: entity, restraintSet: Record<string, number>, faction?: string, power?: number): number;
    function KDGetEquipDuration(restraint: string, player: entity): number;
    function KDDoEquipDelayed(data: any, player: entity): string;
    function KDDoEquipGenericDelayed(data: any, player: entity): string;
    function KDResetPreferenceFlags(): void;
    function KDGetPreferenceFlags(): string[];
    function KDUpdatePreferenceFlags(): void;
    function KDDefaultItemPalette(name: string, variantName: string): string;
    function KDDefaultNPCItemPalette(name: string): string;
    function KDGetBaseLimitChance(StruggleType: string): number;
    function KDSwapEvents(events: KinkyDungeonEvent[], oldRestraint: restraint, newRestraint: restraint): KinkyDungeonEvent[];
    function KDRemoveMasterwork(remover: entity): void;
    function KDCountMasterworks(player: entity, worn?: boolean, inventory?: boolean): number;
    function KDGetNeededMasterworkCount(): number;
    function KDHasMasterworkSet(player: entity): boolean;
    function KDSummonMasterworkTrap(x: number, y: number): entity;
    function KDSummonLatexKittyTrap(x: number, y: number): entity;
    let KDLeashPullCost: number;
    let KDLeashPullKneelTime: number;
    let KDLeashablePersonalities: {
        "": (entity: entity, leasher: entity) => boolean;
        Dom: (entity: entity, leasher: entity) => boolean;
        Sub: (entity: entity, leasher: entity) => boolean;
        Brat: (entity: entity, leasher: entity) => boolean | KDLeashData;
    };
    let KDLeashTick: {
        [_: string]: (delta: number, entity: entity, leasher: entity) => boolean;
    };
    let KDLeashReason: {
        [_: string]: (entity: entity) => boolean;
    };
    function KDGetLeashedToCount(entity: entity): number;
    function KDGetLeashedTo(entity: entity): entity[];
    function KDGetTetherLength(entity: entity): number;
    function KDIsPlayerTethered(entity: entity): boolean;
    function KDUpdateLeashCondition(entity: entity, noDelete?: boolean): boolean;
    function KinkyDungeonAttachTetherToEntity(dist: number, entity: entity, player: entity, reason?: string, color?: string, priority?: number, item?: item): KDLeashData;
    function KDIsPlayerTetheredToLocation(player: entity, x: number, y: number, entity?: entity): boolean;
    function KDIsPlayerTetheredToEntity(player: entity, entity: entity): boolean;
    function KDBreakTether(player: entity): boolean;
    function KinkyDungeonDrawTethers(CamX: number, CamY: number): void;
    function KDBreakAllLeashedTo(entity: entity, reason?: string): void;
    function KinkyDungeonUpdateTether(delta: number, Msg: boolean, Entity: entity, xTo?: number, yTo?: number): boolean;
    function KDWillingLeash(entity: entity): boolean;
    let KDAOETypes: {
        slash: (bx: any, by: any, xx: any, yy: any, rad: any, modifier: string, ox: any, oy: any) => boolean;
        arc: (bx: any, by: any, xx: any, yy: any, rad: any, modifier: string, ox: any, oy: any) => boolean;
        cross: (bx: any, by: any, xx: any, yy: any, rad: any, modifier: string, ox: any, oy: any) => boolean;
        Xcross: (bx: any, by: any, xx: any, yy: any, rad: any, modifier: string, ox: any, oy: any) => boolean;
        crossCrack: (bx: any, by: any, xx: any, yy: any, rad: any, modifier: string, ox: any, oy: any) => boolean;
        XcrossCrack: (bx: any, by: any, xx: any, yy: any, rad: any, modifier: string, ox: any, oy: any) => boolean;
    };
    interface KDStruggleButtonGetData {
        StruggleType: string;
        x: number;
        y: number;
        ButtonWidth: number;
        sg: any;
        item: item;
    }
    interface KDStruggleButtonData extends KDStruggleButtonGetData {
        btn: string;
        button_index: number;
    }
    interface KDStruggleGroupReturn {
        i: number;
        allowed: boolean;
        type: string;
        action?: (bdata: any) => boolean;
        image?: string;
    }
    let KDStruggleButtons: Record<string, (data: KDStruggleButtonData, i: number, query: boolean, target: entity, entity: entity) => KDStruggleGroupReturn>;
    function KDGetStruggleButtons(data: KDStruggleButtonGetData): string[];
    function KDGetStruggleContextMenu(item: item, sg: StruggleGroup, target: entity, entity: entity): string[];
    let KDUISmoothness: number;
    let KDInteracting: boolean;
    let KinkyDungeonStruggleGroups: StruggleGroup[];
    let KinkyDungeonStruggleGroupsBase: string[];
    let KDDrawStruggleEnum: {
        MOST: number;
        FULL: number;
        STRUGGLE: number;
        NONE: number;
    };
    let KinkyDungeonDrawStruggle: number;
    let KDPlayerSetPose: boolean;
    let KDToggleXRay: number;
    let KDBulletTransparency: boolean;
    let KD_XRayHidden: string[];
    let KinkyDungeonDrawStruggleHover: boolean;
    let KinkyDungeonDrawState: string;
    let KinkyDungeonDrawStatesModal: string[];
    let KinkyDungeonSpellValid: boolean;
    let KinkyDungeonCamX: number;
    let KinkyDungeonCamY: number;
    let KinkyDungeonCamXLast: number;
    let KinkyDungeonCamYLast: number;
    let KinkyDungeonCamXVis: number;
    let KinkyDungeonCamYVis: number;
    let KinkyDungeonTargetX: number;
    let KinkyDungeonTargetY: number;
    let KinkyDungeonLastDraw: number;
    let KinkyDungeonLastDraw2: number;
    let KinkyDungeonDrawDelta: number;
    let KD_HUD_RESTRAINTINFOFONTSIZE: number;
    let KD_HUD_RESTRAINTINFOLINESIZE: number;
    const KinkyDungeonLastChatTimeout = 10000;
    let KinkyDungeonStatBarHeight: number;
    let KinkyDungeonToggleAutoPass: boolean;
    let KinkyDungeonToggleAutoSprint: boolean;
    let KinkyDungeonInspect: boolean;
    let KinkyDungeonFastMove: boolean;
    let KinkyDungeonFastMovePath: any[];
    let KinkyDungeonFastStruggle: boolean;
    let KinkyDungeonFastStruggleType: string;
    let KinkyDungeonFastStruggleGroup: string;
    let KDMinBuffX: number;
    let KDMinBuffXTarget: number;
    let KDToggleShowAllBuffs: boolean;
    let KDFocusControls: string;
    let KDFocusControlButtons: {
        AutoPass: {
            HelplessEnemies: boolean;
            HelplessAllies: boolean;
            Summons: boolean;
            Allies: boolean;
            Neutral: boolean;
            Shop: boolean;
            Special: boolean;
        };
        AutoPath: {
            SuppressBeforeCombat: boolean;
            SuppressDuringCombat: boolean;
            StepDuringCombat: boolean;
        };
        AutoWait: {
            Slow: boolean;
            Normal: boolean;
            Fast: boolean;
            VeryFast: boolean;
        };
    };
    let KDFocusControlButtonsExclude: {
        AutoPathStepDuringCombat: string[];
        AutoPathSuppressDuringCombat: string[];
        AutoWaitSlow: string[];
        AutoWaitFast: string[];
        AutoWaitVeryFast: string[];
        AutoWaitNormal: string[];
    };
    let KDFocusHoverEnter: number;
    let KDFocusHoverDelay: number;
    let KDFocusHoverLast: string;
    let KDBuffSprites: {
        Camo: boolean;
        Drenched: boolean;
        StoneSkin: boolean;
        Conduction: boolean;
        Ignite: boolean;
        Burning: boolean;
        Unsteady: boolean;
        Unsteady2: boolean;
        Chilled: boolean;
        ChillWalk: boolean;
        Slimed: boolean;
        LightningRod: boolean;
        PoisonDagger: boolean;
        Cutting: boolean;
        Slippery: boolean;
        ScrollVerbal: boolean;
        ScrollArms: boolean;
        ScrollLegs: boolean;
        Empower: boolean;
        SlimeMimic: boolean;
        d_SlimeMimic: boolean;
        DisenchantSelf: boolean;
        LeatherBurst: boolean;
        TabletElements: boolean;
        TabletConjure: boolean;
        TabletIllusion: boolean;
        TabletRope: boolean;
        TabletWill: boolean;
        TabletMetal: boolean;
        TabletLatex: boolean;
        TabletLeather: boolean;
        AvatarFire: boolean;
        AvatarWater: boolean;
        AvatarEarth: boolean;
        AvatarAir: boolean;
        DistractionCast: boolean;
        ManaBurst: boolean;
        BoundByFate: boolean;
        Taunted: boolean;
        GreaterInvisibility: boolean;
        Invisibility: boolean;
        Haunted: boolean;
        Cursed: boolean;
        DildoBatBuff: boolean;
        Corrupted: boolean;
        CursedDistract: boolean;
        ForcedSubmission: boolean;
        CursingCircle: boolean;
    };
    let KDStatsSkipLine: {
        info: number;
        training: number;
        status: number;
        dmg: number;
        resist: number;
    };
    let KDStatsSkipLineBefore: {
        kinky: number;
        curse: number;
        perk: number;
    };
    let KDStatsOrder: {
        info: number;
        status: number;
        training: number;
        resist: number;
        dmg: number;
        help: number;
        buffs: number;
        perk: number;
        kinky: number;
        curse: number;
    };
    let KDUIColor: string;
    let KDUIAlpha: number;
    let KDUIColorHighlight: string;
    let KDUIAlphaHighlight: number;
    let KDModalArea_x: number;
    let KDModalArea_y: number;
    let KDModalArea_width: number;
    let KDModalArea_height: number;
    let KDModalArea: boolean;
    let KDConfirmDeleteSave: boolean;
    let KDConfirmUpload: boolean;
    function KDHandleGame(): boolean;
    function KDGetDungeonName(coord: WorldCoord): string;
    function KinkyDungeonDrawInterface(_showControls: boolean): void;
    function KDDrawSpellChoices(): void;
    function KDCycleSpellPage(reverse?: boolean, noWrap?: boolean, force?: boolean): void;
    function KinkyDungeonCanSleep(): boolean;
    function KDLinspace(min: number, max: number, steps: number): number[];
    function KDSteps(max: number, step: number, maxStep?: number): number[];
    function KDDrawStatusBars(x: number, y: number, width?: number): void;
    function KDDrawWeaponSwap(x: number, y: number): boolean;
    let KDLastKneelTurns: number;
    function KinkyDungeonDrawActionBar(_x: number, _y: number): void;
    function KDAutoStruggleClick(): void;
    function KinkyDungeonActivateWeaponSpell(instant?: boolean): boolean;
    function KinkyDungeonRangedAttack(x?: number, y?: number): boolean;
    function KinkyDungeonHandleHUD(): boolean;
    let KDStruggleGroupLinkIndex: {};
    function KDGetAdjacentGroups(group: string, max?: number): string[];
    function KinkyDungeonUpdateStruggleGroups(): void;
    interface StruggleGroup {
        group: string;
        left: boolean;
        y: number;
        icon: string;
        name: string;
        lock: string;
        magic: boolean;
        noCut: boolean;
        curse: string;
        blocked: boolean;
    }
    function KDCanStruggle(item: item): boolean;
    function KDCanRemove(item: item): boolean;
    function KDGetItemLinkIndex(inv: item, _allowInaccessible?: boolean): number;
    function KDGetItemLinkHost(inv: item): item;
    function KDDrawNavBar(skip: number, _quit?: boolean): void;
    function KDCullSpellChoices(): void;
    let currentHighlightedItem: item;
    let currentHighlightedItemNoReset: boolean;
    let currentDrawnSG: StruggleGroup;
    let currentDrawnSGlayers: any[];
    let currentDrawnSGLength: number;
    function KDSetFocusControl(control: string): void;
    function KDInitFocusControl(control: string): void;
    function KDSetFocusControlToggle(key: any, value: any): void;
    function KDInputFocusControlToggle(key: string, value: boolean): void;
    function KDDrawMMButtons(MinimapX: number, MinimapY: number, zIndex: number): void;
    function KDDrawRightMMButtons(MinimapX: number, MinimapY: number, zIndex: number, MinimapWidth: number): void;
    let KDMMLabels_Chest: boolean;
    let KDMMLabels_Shrine: boolean;
    let KDMMLabels_Other: boolean;
    function KDDrawMinimap(MinimapX: number, MinimapY: number): void;
    function KDDrawPartyMembers(PartyX: number, PartyY: number, tooltips: object[]): void;
    interface statInfo {
        text: string;
        icon?: string;
        count?: string;
        category: string;
        priority?: number;
        color: string;
        bgcolor: string;
        countcolor?: string;
        click?: string;
        buffid?: string;
    }
    function KDGetStatsWeaponCast(): Record<string, statInfo>;
    function KDProcessBuffIcons(minXX: number, minYY: number, side?: boolean): void;
    function KDDrawBuffIcons(minXX: number, minYY: number, statsDraw: Record<string, statInfo>, side: boolean): void;
    let KDLastStruggleTypeTooltip: string;
    function KDDrawStruggleGroups(): void;
    function KDTightnessRank(tightness: number): string;
    function KDTrySetFocusControl(control: string): void;
    let lastExtraTooltipCycleTimeAuto: number;
    let lastExtraTooltipCycleTimeAuto_Delay: number;
    let lastExtraTooltipCycleTimeAuto_ManualDelay: number;
    interface KDLight {
        x: number;
        y: number;
        y_orig?: number;
        x_orig?: number;
        visualxoffset?: number;
        visualyoffset?: number;
        brightness: number;
        color: number;
        nobloom?: boolean;
    }
    let KDDebugOverlay: boolean;
    let CHIBIMODEND: PoseMod[];
    let CHIBIMOD: PoseMod[];
    let KDInspectCamera: {
        x: number;
        y: number;
    };
    let KDRecentRepIndex: number;
    let KDWallReplacers: string;
    let KinkyDungeonSuppressSprint: boolean;
    let KDReturnButtonXX: number;
    let KDIntenseFilter: any;
    let KDButtonHovering: boolean;
    let KDDistractionFlashTime: number;
    let KDDistractionFlashStrengthTime: number;
    let KDDistractionFlashStrength: number;
    let KDDistractionFlashLastTime: number;
    let KDAnimTick: number;
    let KDAnimTickInterval: number;
    let KDAnimTime: number;
    let KDFloatAnimTime: number;
    let KDSquishyAnimTime: number;
    let KDBreathAnimTime: number;
    let KDFlipPlayer: boolean;
    let pixiview: HTMLCanvasElement;
    let pixirenderer: any;
    let pixirendererKD: any;
    let kdgamefog: any;
    let kdBGMask: any;
    let kdgamefogsmoothDark: any;
    let kdgamefogsmooth: any;
    let kdgamesound: any;
    let kdsolidcolorfilter: any;
    let kdoutlinefilter: any;
    let KDOutlineFilterCache: Map<any, any>;
    let kdminimap: any;
    let kdmapboard: any;
    let kdlightmap: any;
    let kdlightmapGFX: any;
    let kdbrightnessmap: any;
    let kdbrightnessmapGFX: any;
    let kddarkdesaturatefilter: any;
    let kdfogfilter: any;
    let kdgammafilterstore: number[];
    let kdgammafilter: any;
    let kdmultiplyfilter: any;
    let KDBoardFilters: any[];
    let kdenemyboard: any;
    let kdenemystatusboard: any;
    let kdbulletboard: any;
    let kdeffecttileboard: any;
    let kdUItext: any;
    let kdstatusboard: any;
    let kdfloatercanvas: any;
    let kddialoguecanvas: any;
    let kdenemydialoguecanvas: any;
    let kditemsboard: any;
    let kdwarningboard: any;
    let kdwarningboardOver: any;
    let kdgameboard: any;
    let kdui: any;
    let kdcanvas: any;
    let kdpalettecontainer: any;
    let statusOffset: number;
    let kdparticles: any;
    let KDTextWhite: string;
    let KDTextGray3: string;
    let KDBookTextNew: string;
    let KDTextTanNew: string;
    let KDBookTextSB: string;
    let KDTextTanSB: string;
    let KDBookText: string;
    let KDTextTan: string;
    let KDTextGray2: string;
    let KDTextGray1: string;
    let KDTextGray05: string;
    let KDTextGray0: string;
    let KDTextGreen1: string;
    let KDTextBlue1: string;
    let KDTextRed1: string;
    let KDCurseColor: string;
    let KDGoodColor: string;
    let KDTutorialColor: string;
    let kdSpritesDrawn: Map<string, boolean>;
    let kdRTlastLookup: Map<string, number>;
    let kdTexlastLookup: Map<string, number>;
    let kdlightsprites: Map<string, any>;
    let kdpixisprites: Map<string, any>;
    let kdRTcache: Map<string, PIXIRenderTexture>;
    let kdRTSpritecache: Map<PIXIRenderTexture, PIXISprite>;
    let kdTexcache: Map<string, PIXITexture>;
    let kdminimapsprites: Map<string, any>;
    let kdpixifogsprites: Map<string, any>;
    let kdpixibrisprites: Map<string, any>;
    let kdFilterSprites: Map<PIXISprite | PIXITexture, {
        hash: string;
        filter: PIXIFilter;
    }[]>;
    let kdprimitiveparams: Map<string, any>;
    let kdpixitex: Map<string, any>;
    function KDWallVert(x: number, y: number, noReplace?: string): boolean;
    function KDWallVertAbove(x: number, y: number, noReplace?: string): boolean;
    function KDWallVertBoth(x: number, y: number, noReplace?: string): boolean;
    function KDWallHorizTunnel(x: number, y: number): boolean;
    function KDWallVertTunnel(x: number, y: number): boolean;
    let KDChainablePillar: string;
    const KDSprites: KDSprites;
    const KDOverlays: KDSprites;
    const KDOverlays2: KDSprites;
    function KinkyDungeonGetSprite(code: string, x: number, y: number, Fog: boolean, noReplace: string): string;
    function KinkyDungeonGetSpriteOverlay2(code: string, x: number, y: number, Fog: boolean, noReplace: string): string;
    function KinkyDungeonGetSpriteOverlay(code: string, x: number, y: number, Fog: boolean, noReplace: string): string;
    let KDSpecialChests: {
        silver: string;
        shadow: string;
        lessershadow: string;
        kitty: string;
        robot: string;
    };
    let KDLastKeyTime: Record<string, number>;
    function KDDoModalX(_bdata: any): void;
    function KDGetSpellRange(spell: spell): number;
    function KinkyDungeonDrawPlayerNameInMenus(): void;
    function KinkyDungeonDrawGame(): void;
    function KDShouldDrawFloaters(): boolean;
    function KDDrawArousalScreenFilter(_y1: number, _h: number, _Width: number, _ArousalOverride: number, _Color?: string, _AlphaBonus?: number): void;
    function KDCanAttack(): boolean;
    let KinkyDungeonFloaters: any[];
    let KinkyDungeonLastFloaterTime: number;
    let KDTimescale: number;
    let KDBulletSpeed: number;
    let KDEntitiesFloaterRegisty: Map<any, any>;
    let KDFloaterSpacing: number;
    function KinkyDungeonSendFloater(Entity: entity, Amount: number | string, Color: string, Time?: number, LocationOverride?: boolean, suff?: string, size?: number, prefix?: string): void;
    let KDFloaterGridRes: number;
    let KDFloaterGridCache: Record<string, number>;
    let KDFloaterGridWipedOutAlpha: number;
    function KinkyDungeonDrawFloaters(CamX: number, CamY: number, onlyAbs?: boolean): void;
    function KDEase(value: number): number;
    let KinkyDungeonMessageToggle: boolean;
    let KinkyDungeonMessageLog: any[];
    let KDLogDist: number;
    let KDMSGFontSize: number;
    let KDLogHeight: number;
    let KDMaxLog: number;
    let KDLogTopPad: number;
    let KDLogIndex: number;
    let KDLogIndexInc: number;
    let KDMsgWidth: number;
    let KDMsgWidthMin: number;
    let KDMsgX: number;
    let KDMsgFadeTime: number;
    let KDMaxConsoleMsg: number;
    let KDLogFilters: string[];
    function KinkyDungeonDrawMessages(NoLog?: boolean, shiftx?: number, noBG?: boolean, width?: number): void;
    function KDhexToRGB(h: string): {
        r: string;
        g: string;
        b: string;
    };
    function KinkyDungeonUpdateVisualPosition(Entity: any, amount: number): number;
    function KinkyDungeonSetTargetLocation(helper?: boolean, mx?: number, my?: number): void;
    function KDGetMoveDirection(): {
        x: number;
        y: number;
    };
    function KinkyDungeonSetMoveDirection(): void;
    type RectParams = {
        Left: number;
        Top: number;
        Width: number;
        Height: number;
        Color: string;
        zIndex: number;
        LineWidth?: number;
        alpha?: number;
    };
    type CircParams = {
        Left: number;
        Top: number;
        Radius: number;
        StartAngle: number;
        EndingAngle: number;
        CounterClockwise: boolean;
        Color: string;
        zIndex: number;
        LineWidth?: number;
        alpha?: number;
        Rotation?: number;
    };
    type CircleParams = {
        Left: number;
        Top: number;
        Radius: number;
        Color: string;
        zIndex: number;
        LineWidth?: number;
        alpha?: number;
    };
    let KDBoxThreshold: number;
    let KDButtonColor: string;
    let KDButtonColorIntense: string;
    let KDBorderColor: string;
    function DrawBoxKD(Left: number, Top: number, Width: number, Height: number, Color: string, NoBorder?: boolean, Alpha?: number, zIndex?: number): void;
    function DrawBoxKDTo(Container: PIXIContainer, Left: number, Top: number, Width: number, Height: number, Color: string, NoBorder?: boolean, Alpha?: number, zIndex?: number): void;
    let KDFont: string;
    function DrawTextFitKD(Text: string, X: number, Y: number, Width: number, Color: string, BackColor?: string, FontSize?: number, Align?: string, zIndex?: number, alpha?: number, border?: number, unique?: boolean, font?: string): number;
    type TextParamsType = {
        Text: string;
        X: number;
        Y: number;
        Width?: number;
        Color: string;
        BackColor: string;
        FontSize?: number;
        align?: string;
        zIndex?: number;
        alpha?: number;
        border?: number;
        unique?: boolean;
        font?: string;
    };
    function DrawTextFitKDTo(Container: PIXIContainer, Text: string, X: number, Y: number, Width: number, Color: string, BackColor?: string, FontSize?: number, Align?: string, zIndex?: number, alpha?: number, border?: number, unique?: boolean, font?: string): number;
    function DrawTextFitKDTo2(Container: PIXIContainer, Map: Map<string, any>, Text: string, X: number, Y: number, Width: number, Color: string, BackColor?: string, FontSize?: number, Align?: string, zIndex?: number, alpha?: number, border?: number, unique?: boolean, font?: string): number;
    function DrawTextKD(Text: string, X: number, Y: number, Color: string, BackColor?: string, FontSize?: number, Align?: string, zIndex?: number, alpha?: number, border?: number): number;
    let KDAllowText: boolean;
    function DrawTextVisKD(Container: PIXIContainer, Map: Map<string, any>, id: string, Params: TextParamsType): number;
    function DrawRectKD(Container: PIXIContainer, Map: Map<string, any>, id: string, Params: RectParams): boolean;
    function DrawCircleKD(Container: PIXIContainer, Map: Map<string, any>, id: string, Params: RectParams): boolean;
    function DrawCrossKD(Container: PIXIContainer, Map: Map<string, any>, id: string, Params: RectParams): boolean;
    function FillCircleKD(Container: PIXIContainer, Map: Map<string, any>, id: string, Params: CircleParams): boolean;
    function FillRectKD(Container: PIXIContainer, Map: Map<string, any>, id: string, Params: RectParams): boolean;
    function FillCircleBarKD(Container: PIXIContainer, Map: Map<string, any>, id: string, Params: CircParams): boolean;
    type ButtonOptions = {
        noTextBG?: boolean;
        alpha?: number;
        zIndex?: number;
        unique?: boolean;
        scaleImage?: boolean;
        centered?: boolean;
        centerText?: boolean;
        tint?: string;
        hotkey?: string;
        hotkeyPress?: string;
        filters?: any[];
        font?: string;
        fontSize?: number;
        maxWidth?: number;
    };
    function DrawButtonVis(Left: number, Top: number, Width: number, Height: number, Label: string, Color: string, Image?: string, HoveringText?: string, Disabled?: boolean, NoBorder?: boolean, FillColor?: string, FontSize?: number, ShiftText?: boolean, Stretch?: boolean, zIndex?: number, options?: ButtonOptions): void;
    function DrawButtonVisTo(Container: PIXIContainer, Left: number, Top: number, Width: number, Height: number, Label: string, Color: string, Image?: string, HoveringText?: string, Disabled?: boolean, NoBorder?: boolean, FillColor?: string, FontSize?: number, ShiftText?: boolean, Stretch?: boolean, zIndex?: number, options?: ButtonOptions): void;
    function DrawCheckboxVis(Left: number, Top: number, Width: number, Height: number, Text: string, IsChecked: boolean, Disabled?: boolean, TextColor?: string, CheckImage?: string, options?: ButtonOptions): void;
    function DrawCheckboxKDEx(name: string, func: (bdata: any) => boolean, enabled: boolean, Left: number, Top: number, Width: number, Height: number, Text: string, IsChecked: boolean, Disabled?: boolean, TextColor?: string, CheckImage?: string, options?: ButtonOptions): void;
    function DrawBackNextButtonVis(Left: number, Top: number, Width: number, Height: number, Label: string, _Color: string, Image?: string, _BackText?: () => string, _NextText?: () => string, Disabled?: boolean, ArrowWidth?: number, _NoBorder?: boolean, options?: ButtonOptions): void;
    function KDDrawMap(CamX: number, CamY: number, CamX_offset: number, CamY_offset: number, _CamX_offsetVis: number, _CamY_offsetVis: number, Debug?: boolean): any;
    function KDDraw(Container: PIXIContainer, Map: Map<string, any>, id: string, Image: string, Left: number, Top: number, Width: number, Height: number, Rotation?: number, options?: any, Centered?: boolean, SpritesDrawn?: Map<string, boolean>, Scale?: number, Nearest?: boolean): any;
    let KDAdaptiveTexCache: Map<string, number>;
    let KDAdaptiveTexCacheThreshold: number;
    let KDAdaptiveTexCacheMax: number;
    function KDTickAdaptiveTexCache(delta: number): void;
    function KDDoAdaptiveTexCache(id: string, delta: number): boolean;
    function KDGetOrMakeRenderTexture(Image: string, Nearest: boolean, id: string, filters: PIXIFilter[], force?: boolean, useAtlas?: boolean, resolution?: number): PIXITexture;
    function KDDrawRT(Container: PIXIContainer, Map: Map<string, any>, id: string, filterid: string, Image: string, Left: number, Top: number, Width: number, Height: number, Rotation?: number, options?: any, Centered?: boolean, SpritesDrawn?: Map<string, boolean>, Scale?: number, Nearest?: boolean, baseFilters?: PIXIFilter[], force?: boolean, useAtlas?: boolean, resolution?: number): any;
    let OPTIONS_NEAREST: {
        scaleMode: any;
    };
    let errorImg: {};
    function KDTex(Image: string, Nearest?: boolean): PIXITexture;
    function string2hex(str: string): any;
    function GetAdjacentList(list: string[], index: number, width: number): {
        left: string[];
        right: string[];
    };
    function KDEnumLights(data: {
        lights: KDLight[];
        maplights: KDLight[];
        effecttilelights: KDLight[];
    }): void;
    function KDUpdateVision(CamX?: number, CamY?: number, _CamX_offset?: number, _CamY_offset?: number): void;
    function KDObjectTooltip(x: number, y: number, fallback: string): string;
    let KDTileTooltips: Record<string, (x: number, y: number) => {
        color: string;
        text: string;
        desc?: string;
        noInspect?: boolean;
    }>;
    function KDGetTileColor(x: number, y: number): string;
    function KDDrawTileTooltip(maptile: string, x: number, y: number, offset: number): number;
    let KDEffectTileTooltips: Record<string, {
        color: string;
        code: (tile: effectTile, x: number, y: number, TooltipList: any[]) => void;
    }>;
    function KDETileTooltipSimple(tile: effectTile, TooltipList: any[], color: string, extra?: string, descColor?: string, extraColor?: string): void;
    function KDDrawEffectTileTooltip(tile: effectTile, x: number, y: number, offset: number): number;
    function KDDrawTooltip(TooltipList: any[], offset: number, hidebg?: boolean): number;
    let KDTempElements: Map<any, any>;
    let KDDrawnElements: Map<any, any>;
    function KDTextArea(Name: string, Left: number, Top: number, Width: number, Height: number): {
        Element: any;
        Created: boolean;
    };
    function KDTextField(Name: string, Left: number, Top: number, Width: number, Height: number, Type?: string, Value?: string, MaxLength?: string, TextSize?: number): {
        Element: any;
        Created: boolean;
    };
    function KDCullTempElements(): void;
    function KDElementPosition(ElementID: string, X: number, Y: number, W: number, H?: number, FS?: number): void;
    function KDShowQuickInv(): boolean;
    let KDUpdateFog: boolean;
    let KDLastCamPos: {
        x: number;
        y: number;
    };
    let KDDrawPlayer: boolean;
    function KDPlayerDrawPoseButtons(C: Character): void;
    function KDGetLightColor(x: number, y: number): number;
    function KDGetLightColorGreyscale(x: number, y: number): number;
    function KDMouseInModalArea(): boolean;
    function KDPointInModalArea(X: number, Y: number): boolean;
    function KDPointInPlayableArea(X: number, Y: number): boolean;
    function KDMouseInPlayableArea(): boolean;
    function KDHotkeyToText(hotkey: string): string;
    function KDGetTargetRetType(x: number, y: number): string;
    let KDPIXIPaletteFilters: Map<string, PIXIFilter[]>;
    function KDDrawCustomPalettes(palettes: Record<string, Record<string, LayerFilter>>, paletteID: string, x: number, y: number, w: number, scale: number, selected: string, callback?: (s: string) => void, text?: string, deffault?: string): void;
    function KDDrawPalettes(x: number, y: number, w: number, scale: number, selected: string, callback?: (s: string) => void, text?: string, deffault?: string): void;
    function KDGetOutlineFilter(color: number, alpha: number, quality: number, thickness: number): PIXIFilter;
    function KDClearOutlineFilterCache(): void;
    let KDForceAllCull: boolean;
    let KDLastFilterSpritesSanitize: number;
    function KDDoGraphicsSanitize(): void;
    function KDGetFontMult(font?: string): any;
    let KDCustomDraw: {
        Bondage: () => void;
    };
    type InvColorFilterData = {
        restraints: Record<string, NPCRestraint>;
        id: number;
        entity: entity;
        player: entity;
        force: boolean;
    };
    let KDCustomDrawInvColorFilter: {
        Bondage: (data: InvColorFilterData) => (inv: any) => string;
    };
    function KDPlayerZoom(PlayerModel: ModelContainer): number;
    function KDDrawChibi(Character: Character, x: number, y: number, zoom: number): void;
    function MouseOverChar(): boolean;
    function KDGetBoxShiftOffset(x: number, y: number, w: number, h: number, xpad?: number, ypad?: number): KDPoint;
    let KDContextMenuFontSizeMobile: number;
    let KDContextMenuFontSize: number;
    function KDDrawContextMenu(draw: boolean, mouseX: number, mouseY: number, options: string[], optionImages: Record<string, string>, optionActions: Record<string, (mouseX: number, mouseY: number) => void>, optionGrey: Record<string, boolean>, optionText: Record<string, string>, optionColor: Record<string, string>): string;
    function KDSpellValid(x: number, y: number, spellRange: number, projAimOverride?: boolean): boolean;
    let KDCurrentProgressMainSelection: string;
    function KinkyDungeonDrawProgress(xOffset?: number): void;
    interface ProgressListData {
        name: string;
        data?: Record<string, string>;
        progress: number;
        color: string;
        bordercolor: string;
        textColor: string;
        level?: number;
        priority: number;
    }
    interface ProgressListEventData {
        list: ProgressListData[];
        trainings: ProgressListData[];
    }
    function KDEnumerateTrainingProgress(data: ProgressListEventData): void;
    function KDEnumerateMainProgress(data: ProgressListEventData): void;
    function KDEnumerateProgressItems(sort?: boolean): ProgressListData[];
    function KDDrawProgressList(xOffset: any): void;
    let KDScrollableListDataset: Record<string, KDScrollableListData>;
    interface KDScrollableListData {
        index: number;
        x: number;
        y: number;
        w: number;
        h: number;
        num_per_page: number;
        zIndex: number;
        allowWrap: boolean;
        visual_index: number;
        click_hold_y: number;
        click_hold_y_index: number;
        max: number;
        min: number;
        selectedindex: number;
        items: any[];
        lastUpdated: number;
        updateInterval: number;
    }
    let KDScrollableListExp: number;
    let KDScrollableListMin: number;
    let KDScrollBarSpacingW: number;
    let KDScrollBarW: number;
    function ShouldUpdateList(name: string, reset?: boolean): boolean;
    function ForceUpdateList(name: string): void;
    function PopulateList(name: string, x: number, y: number, w: number, h: number, z: number, num_per_page: number, list: any[], allowWrap?: boolean): KDScrollableListData;
    function KDFixScrollableList(name: string, pad?: number): boolean;
    function KDScrollScrollableLists(mouseX: number, mouseY: number, scrollAmount: number): boolean;
    function KDScrollScrollableList(name: string, amount: number): boolean;
    function KDUpdateScrollableLists(delta: number): void;
    let KDPIXIScrollableListContainers: Record<string, PIXIContainer>;
    function KDDrawScrollableList(name: string, useContainer: boolean, drawCallback: (container: PIXIContainer, isClickable: boolean, item: any, index: number, visualIndex: number, isSelected: boolean, selectedIndex: number, list: KDScrollableListData) => boolean, drawBG?: boolean, horizontal?: boolean, scrollbarSize?: number, scrollSuff?: string, scrollhotkeyUp?: string, scrollhotkeyDown?: string): any;
    let KDContextMenu: boolean;
    let KDContextX: number;
    let KDContextY: number;
    let KDContextXX: number;
    let KDContextYY: number;
    let KDContextW: number;
    let KDContextH: number;
    let KDContextStage: string;
    let KDGetContextActions: {
        RestraintContext: (draw: any, mouseX: any, mouseY: any, data: any) => {
            options: string[];
            optionImages: Record<string, string>;
            optionActions: Record<string, (mouseX: number, mouseY: number) => void>;
            optionGrey: Record<string, boolean>;
            optionText: Record<string, string>;
            optionColor: Record<string, string>;
        };
        Game: (draw: any, mouseX: any, mouseY: any, data: any) => {
            options: string[];
            optionImages: Record<string, string>;
            optionActions: Record<string, (mouseX: number, mouseY: number) => void>;
            optionGrey: Record<string, boolean>;
            optionText: Record<string, string>;
            optionColor: Record<string, string>;
        };
    };
    let KDDrawGameContextMenu: {
        RestraintContext: (draw: any, mouseX: any, mouseY: any) => string[];
        Game: (draw: any, mouseX: any, mouseY: any) => string[];
    };
    function KDGetGameContextActionsVanilla(draw: boolean, options: string[], optionImages: Record<string, string>, optionActions: Record<string, (mouseX: number, mouseY: number) => void>, optionGrey: Record<string, boolean>, optionText: Record<string, string>, optionColor: Record<string, string>): void;
    function KDGetRestraintContextActionsVanilla(item: item, sg: StruggleGroup, index: number, target: entity, entity: entity, draw: boolean, options: string[], optionImages: Record<string, string>, optionActions: Record<string, (mouseX: number, mouseY: number) => void>, optionGrey: Record<string, boolean>, optionText: Record<string, string>, optionColor: Record<string, string>): void;
    function KDContextMenuWeaponSpecialSuff(special: KDWeaponSpecial): "" | "attack" | "ignite" | "hitorspell" | "selfcast";
    function KDShowInventory(container: string[]): void;
    let KinkyDungeonKilledEnemy: any;
    let KinkyDungeonAlert: number;
    let KDMaxPreviousWeapon: number;
    let KDMINDAMAGENOISE: number;
    let KDDMGSOUNDMULT: number;
    let KDBrawlerAmount: number;
    let KDClumsyAmount: number;
    let KDUnfocusedParams: {
        AmountMin: number;
        AmountMax: number;
        ThreshMin: number;
        ThreshMax: number;
    };
    interface KDBulletVisual {
        end: boolean;
        temporary: boolean;
        zIndex: number;
        spin: number;
        spinAngle: number;
        name: string;
        size: number;
        spriteID: string;
        xx: number;
        yy: number;
        visual_x: number;
        visual_y: number;
        aoe?: number;
        updated: boolean;
        vx: number;
        vy: number;
        scale: number;
        alpha: number;
        delay: number;
    }
    let KDDodgeAmount: number;
    let KinkyDungeonMissChancePerBlind: number;
    let KinkyDungeonBlockMissChancePerBlind: number;
    let KinkyDungeonMissChancePerSlow: number;
    let KinkyDungeonBulletsVisual: Map<string, KDBulletVisual>;
    let KinkyDungeonBulletsID: Record<string, any>;
    let KDVulnerableDmg: number;
    let KDVulnerableHitMult: number;
    let KDVulnerableBlockHitMult: number;
    let KDPacifistReduction: number;
    let KDEnemyResistHPMult: number;
    let KDRiggerDmgBoost: number;
    let KDRiggerBindBoost: number;
    let KDStealthyHPMult: number;
    let KDStealthyEvaMult: number;
    let KDResilientHPMult: number;
    let KDStealthyEnemyCountMult: number;
    let KDBoundPowerMult: number;
    let KDBerserkerAmp: number;
    let KDUnstableAmp: number;
    let KDFightParams: {
        KDFreezeMeleeMult: number;
        KDFreezeShatterMult: number;
    };
    let KinkyDungeonOpenObjects: string;
    let KinkyDungeonMeleeDamageTypes: string[];
    let KinkyDungeonTeaseDamageTypes: string[];
    let KinkyDungeonPacifistDamageTypes: string[];
    let KinkyDungeonStunDamageTypes: string[];
    let KinkyDungeonBindDamageTypes: string[];
    let KinkyDungeonFreezeDamageTypes: string[];
    let KinkyDungeonSlowDamageTypes: string[];
    let KinkyDungeonVulnerableDamageTypes: string[];
    let KinkyDungeonMeltDamageTypes: string[];
    let KinkyDungeonShatterDamageTypes: string[];
    let KinkyDungeonDismantleDamageTypes: string[];
    let KinkyDungeonIgnoreShieldTypes: string[];
    let KinkyDungeonIgnoreBlockTypes: string[];
    let KDTorchExtinguishTypes: string[];
    let KDSlimeExtinguishTypes: string[];
    let KDIgnitionSources: string[];
    let KDDamageEquivalencies: {
        frost: string;
        souldrain: string;
        drain: string;
        shock: string;
        blast: string;
        estim: string;
    };
    let KDDamageBinds: {
        glue: string;
        ice: string;
        frost: string;
        crush: string;
    };
    let KDSpellTagBinds: {
        rope: string;
        leather: string;
        chain: string;
        metal: string;
        vine: string;
        nature: string;
    };
    let KDResistanceProfiles: {
        rope: Record<any, any>;
        construct: Record<any, any>;
        catgirl: Record<any, any>;
        alchemist: Record<any, any>;
        slime: Record<any, any>;
    };
    let KinkyDungeonDamageTypesExtension: {
        tickle: string;
        grope: string;
        pain: string;
        happygas: string;
        poisongas: string;
        charm: string;
    };
    let KinkyDungeonBindingDamageTypes: string[];
    let KinkyDungeonDistractDamageTypes: string[];
    let KinkyDungeonMasochistDamageTypes: string[];
    let KinkyDungeonPlayerWeapon: string;
    let KinkyDungeonPlayerDamageDefault: weapon;
    let KinkyDungeonPlayerDamage: weapon;
    let KinkyDungeonDamageTypes: {
        heal: {
            name: string;
            color: string;
            bg: string;
            harmless: boolean;
        };
        holy: {
            name: string;
            color: string;
            bg: string;
        };
        acid: {
            name: string;
            color: string;
            bg: string;
        };
        soap: {
            name: string;
            color: string;
            bg: string;
        };
        cold: {
            name: string;
            color: string;
            bg: string;
        };
        arcane: {
            name: string;
            color: string;
            bg: string;
        };
        ice: {
            name: string;
            color: string;
            bg: string;
        };
        frost: {
            name: string;
            color: string;
            bg: string;
        };
        fire: {
            name: string;
            color: string;
            bg: string;
        };
        poison: {
            name: string;
            color: string;
            bg: string;
        };
        poisongas: {
            name: string;
            color: string;
            bg: string;
        };
        happygas: {
            name: string;
            color: string;
            bg: string;
        };
        charm: {
            name: string;
            color: string;
            bg: string;
        };
        soul: {
            name: string;
            color: string;
            bg: string;
        };
        drain: {
            name: string;
            color: string;
            bg: string;
        };
        souldrain: {
            name: string;
            color: string;
            bg: string;
        };
        electric: {
            name: string;
            color: string;
            bg: string;
        };
        estim: {
            name: string;
            color: string;
            bg: string;
        };
        glue: {
            name: string;
            color: string;
            bg: string;
        };
        stun: {
            name: string;
            color: string;
            bg: string;
        };
        chain: {
            name: string;
            color: string;
            bg: string;
        };
        tickle: {
            name: string;
            color: string;
            bg: string;
        };
        plush: {
            name: string;
            color: string;
            bg: string;
        };
        crush: {
            name: string;
            color: string;
            bg: string;
        };
        grope: {
            name: string;
            color: string;
            bg: string;
        };
        slash: {
            name: string;
            color: string;
            bg: string;
        };
        pierce: {
            name: string;
            color: string;
            bg: string;
        };
        pain: {
            name: string;
            color: string;
            bg: string;
        };
        unarmed: {
            name: string;
            color: string;
            bg: string;
        };
        magic: {
            name: string;
            color: string;
            bg: string;
        };
        melee: {
            name: string;
            color: string;
            bg: string;
        };
        spell: {
            name: string;
            color: string;
            bg: string;
        };
    };
    function KDWeapon(item: Named): weapon;
    function KinkyDungeonFindWeapon(Name: string): weapon;
    function KinkyDungeonWeaponCanCut(RequireInteract: boolean, MagicOnly?: boolean): boolean;
    function KDSetWeapon(Weapon: string, forced?: boolean): void;
    function KinkyDungeonGetPlayerWeaponDamage(HandsFree?: boolean, NoOverride?: boolean): weapon;
    function isUnarmed(weapon: weapon): boolean;
    function isUnarmedUnlessBrawler(weapon: weapon): boolean;
    let KinkyDungeonEvasionPityModifier: number;
    let KinkyDungeonEvasionPityModifierIncrementPercentage: number;
    let KDDefaultCrit: number;
    let KDDefaultBindCrit: number;
    function KinkyDungeonGetCrit(accuracy?: number, Damage?: damageInfo, Enemy?: entity, weapon?: weapon): number;
    function KinkyDungeonGetBindCrit(accuracy?: number, Damage?: damageInfo, Enemy?: entity, weapon?: weapon): number;
    function KDGetSpellAccuracy(): number;
    function KDGetSlowMult(Enemy: entity): number;
    let KDSTAMPENTYPE: {
        Weapon: {
            onEvasion: (data: any) => void;
        };
        Staff: {
            onAttack: (data: any) => void;
        };
    };
    function KinkyDungeonGetEvasion(Enemy?: entity, NoOverride?: boolean, IsSpell?: boolean, IsMagic?: boolean, cost?: boolean, forceWeapon?: item): number;
    function KinkyDungeonAggro(Enemy: entity, Spell: spell, Attacker: entity, Faction?: string): void;
    function KDPlayerEvasionPenalty(): number;
    function KDPlayerBlockPenalty(): number;
    function KDRestraintBlockPenalty(): number;
    function KDCalcRestraintBlock(): number;
    function KinkyDungeonPlayerEvasion(Event?: boolean): number;
    function KinkyDungeonPlayerBlock(_Event?: boolean): number;
    function KinkyDungeonPlayerBlockLinear(): number;
    function KinkyDungeonGetPlayerStat(stat: any, mult?: number): number;
    function KDRestraintBlockPower(block: any, power: number): number;
    function KinkyDungeonEvasion(Enemy: entity, IsSpell?: boolean, IsMagic?: boolean, Attacker?: entity, chance?: number, forceWeapon?: item): boolean;
    function KinkyDungeonGetImmunity(tags: any, profile: any, type: any, resist: any, mode?: number): boolean;
    let KDDamageQueue: any[];
    function KDArmorFormula(DamageAmount: number, Armor: number): number;
    function KDDamageEnemy(Enemy: entity, Damage: damageInfo, Ranged: boolean, NoMsg: boolean, Spell?: spell, bullet?: KDBullet, attacker?: entity, Delay?: any, noAlreadyHit?: boolean, noVuln?: boolean, Critical?: any, Attack?: boolean, Weapon?: weapon, forceWeapon?: item): {
        weapon: weapon;
        forceWeapon: item;
        allowConjuredRestraint: boolean;
        useRealRestraint: boolean;
        shieldBlocked: boolean;
        aggro: boolean;
        faction: string;
        enemy: entity;
        spell: spell;
        bullet: KDBullet;
        attacker: entity;
        nocrit: boolean;
        crit: number;
        bindcrit: number;
        type: string;
        bufftype: string | number;
        time: number;
        dmg: number;
        bind: number;
        bindType: string;
        flags: string[];
        boundBonus: number;
        bindEff: number;
        distract: number;
        distractEff: number;
        desireMult: number;
        incomingDamage: damageInfo;
        dmgDealt: number;
        dmgShieldDealt: number;
        freezebroke: boolean;
        froze: number;
        vulnerable: boolean;
        vulnConsumed: boolean;
        critical: any;
        forceCrit: boolean;
        customCrit: boolean;
        noblock: boolean;
        blocked: boolean;
        Delay: any;
        ignoreshield: boolean;
        shield_crit: boolean;
        shield_stun: boolean;
        shield_freeze: boolean;
        shield_bind: boolean;
        shield_snare: boolean;
        shield_slow: boolean;
        shield_distract: boolean;
        shield_vuln: boolean;
        tease: boolean;
        stunResist: number;
        distractMult: any;
    };
    function KinkyDungeonDamageEnemy(Enemy: entity, Damage: damageInfo, Ranged: boolean, NoMsg: boolean, Spell?: spell, bullet?: KDBullet, attacker?: entity, Delay?: any, noAlreadyHit?: boolean, noVuln?: boolean, Critical?: any, Attack?: boolean, Weapon?: weapon, forceWeapon?: item): number;
    function KinkyDungeonDisarm(Enemy: entity, suff?: string): boolean;
    function KinkyDungeonAttackEnemy(Enemy: entity, Damage: damageInfo, chance?: number, bullet?: any, weapon?: weapon, forceWeapon?: item): boolean;
    let KDBulletWarnings: Record<string, any>[];
    let KDUniqueBulletHits: Map<any, any>;
    function KDUpdateBulletEffects(b: any, d: number): void;
    function KinkyDungeonUpdateBullets(delta: number, Allied?: boolean): void;
    function KinkyDungeonUpdateSingleBulletVisual(b: KDBullet, end: boolean, delay?: number): void;
    function KinkyDungeonUpdateBulletVisuals(delta: number): void;
    interface extraWarningTileEntry {
        duration: number;
        delay: number;
        warning: warningTileEntry;
    }
    let KinkyDungeonExtraWarningTiles: extraWarningTileEntry[];
    function KinkyDungeonCreateWarningTile(x: number, y: number, color?: string, duration?: number, delay?: number, x_orig?: number, y_orig?: number): void;
    function KinkyDungeonParseExtraWarningTiles(delta: number): void;
    let KinkyDungeonCurrentTick: number;
    function KinkyDungeonUpdateBulletsCollisions(delta: number, Catchup?: boolean): void;
    function KDCheckCollideableBullets(entity: entity, force: boolean): void;
    function KinkyDungeonBulletHit(b: KDBullet, born: number, outOfTime?: boolean, outOfRange?: boolean, d?: number, dt?: number, end?: boolean): void;
    function KinkyDungeonSummonEnemy(x: number, y: number, summonType: string | enemy, count: number, rad: number, strict?: boolean, lifetime?: number, hidden?: boolean, goToTarget?: boolean, faction?: string, hostile?: boolean, minrad?: number, startAware?: boolean, noBullet?: boolean, hideTimer?: boolean, pathfind?: boolean, mod?: string, boundTo?: number, weakBinding?: boolean, teleportTime?: number, ox?: number, oy?: number, temporary?: boolean): entity[];
    function KinkyDungeonBulletDoT(b: KDBullet): void;
    function KinkyDungeonBulletTrail(b: KDBullet): boolean;
    function KinkyDungeonBulletsCheckCollision(bullet: KDBullet, AoE: boolean, force: boolean, d: number, inWarningOnly?: boolean, _delta?: number): boolean;
    function KDBulletAoECanHitEntity(bullet: KDBullet, enemy: entity): boolean;
    function KDBulletCanHitEntity(bullet: KDBullet, enemy: entity, inWarningOnly?: boolean, overrideCollide?: boolean): boolean;
    function KDBulletEffectTiles(bullet: KDBullet): void;
    function KDBulletHitPlayer(bullet: KDBullet, player: entity): void;
    interface HealData {
        enemy: entity;
        amount: number;
        source: number;
        bullet: KDBullet;
    }
    function KDHealNPC(enemy: entity, amount: number, source: number, bullet?: KDBullet): void;
    function KDBulletHitEnemy(bullet: KDBullet, enemy: entity, d: number, nomsg: boolean): void;
    function KDBulletID(bullet: KDBullet, enemy: entity): string;
    function KDSetBulletFlag(bullet: KDBullet, flag: string, value: boolean): void;
    function KDSetBulletInheritedFlag(bullet: KDBullet, flag: string, value: boolean): void;
    function KDBulletHasFlag(bullet: KDBullet, flag: string): boolean;
    function KinkyDungeonLaunchBullet(x: number, y: number, targetx: number, targety: number, speed: number, bullet: KDBulletData, miscast: boolean, ox: number, oy: number): KDBullet;
    interface LaunchBulletData {
        b: KDBullet;
        bullet: KDBulletData;
        miscast: boolean;
        cancel: boolean;
    }
    let KDLastFightDelta: number;
    function KinkyDungeonDrawFight(_canvasOffsetX: number, _canvasOffsetY: number, CamX: number, CamY: number): void;
    function KinkyDungeonSendWeaponEvent(Event: string, data: any, forceWeapon?: item): void;
    function KinkyDungeonSendBulletEvent(Event: string, b: KDBullet, data: any): void;
    function KDHealRepChange(enemy: entity, amount: number): void;
    function KDApplyGenBuffs(entity: entity, buff: string, time: number): void;
    function KDSilenceEnemy(enemy: entity, time: number): void;
    function KDBlindEnemy(enemy: entity, time: number): void;
    function KDDisarmEnemy(enemy: entity, time: number): void;
    let KDConditions: Record<string, (e: KinkyDungeonEvent, data: any) => boolean>;
    function KDCheckCondition(e: KinkyDungeonEvent, data: any): boolean;
    let KDPrereqs: Record<string, (enemy: entity, e: KinkyDungeonEvent, data: any) => boolean>;
    function KDCheckPrereq(enemy: entity, prereq?: string, e?: KinkyDungeonEvent, data?: any): boolean;
    function KDBulletAoEMod(b: KDBullet): string;
    function KDBulletTrailAoEMod(b: any): any;
    function AOECondition(bx: number, by: number, xx: number, yy: number, rad: number, modifier?: string, originX?: number, originY?: number): boolean;
    function KDCreateParticle(xx: number, yy: number, name: string): void;
    function KDIsTeasing(damage: damageInfo): boolean;
    function KDDealEnvironmentalDamage(x: number, y: number, aoe: number, damage: damageInfo, Attacker?: entity): void;
    function KDCanOffhand(item: item): boolean;
    function KDWeaponNoDamagePenalty(weapon: Named): boolean;
    function KDWeaponIsMagic(weapon: Named): boolean;
    function KDEvasiveManeuversCost(): number;
    function KDEntityBlocksExp(entity: entity): boolean;
    function KDCrackTile(x: number, y: number, allowCrack: boolean, data: any): void;
    function KDBindEnemyWithTags(id: number, tags: string[], amount?: number, power?: number, forceConjure?: boolean, maxTries?: number, allowOverride?: boolean, allowVariants?: boolean, maxAdded?: number, faction?: string, overrideWill?: number): string[];
    function KDWeaponStamPenType(weapon: weapon): string;
    function KDEnemyShieldRegenStopTime(enemy: entity): number;
    function KDAddWarning(tile: WarningTileRecord): void;
    function KDGetWarnings(x: number, y: number): WarningTileRecord[];
    let KinkyDungeonStatStaminaCostAttack: number;
    let KDWeaponLootList: Record<string, Record<string, number>>;
    let KinkyDungeonWeapons: Record<string, weapon>;
    let KinkyDungeonInputQueue: {
        type: string;
        data: any;
    }[];
    let KDInputTypes: Record<string, (data: any) => string>;
    function KDProcessInput(type: string, data: any): string;
    function KDSendInput(type: string, data: any, _frame?: boolean, noUpdate?: boolean, process?: boolean): string;
    function KDProcessInputs(ReturnResult?: boolean): string;
    function KDInteract(x: number, y: number, dist?: number): boolean;
    interface KDFurnitureDef {
        restraintSetLevelBonus?: number;
        floor: string;
        sprite: string;
        restraintTag: string;
        restraintSetTags?: Record<string, number>;
        tickFunction: (delta: number) => void;
        forceFaction?: string;
    }
    let KDFurniture: Record<string, KDFurnitureDef>;
    let KinkyDungeonManaCost: number;
    let KDEmpowerSprite: string;
    let KDMaxEmpower: number;
    let KDConfirmClearSpells: boolean;
    let KinkyDungeonBookScale: number;
    let KDFlashMana: number;
    let KinkyDungeonMysticSeals: number;
    let KinkyDungeonCurrentBook: string;
    let KinkyDungeonCurrentPage: number;
    let KinkyDungeonCurrentSpellsPage: number;
    let KinkyDungeonBooks: string[];
    let KinkyDungeonPreviewSpell: any;
    let KinkyDungeonDisplayLore: boolean;
    let KinkyDungeonSpellChoices: number[];
    let KinkyDungeonWeaponChoices: string[];
    let KinkyDungeonArmorChoices: string[];
    let KinkyDungeonConsumableChoices: string[];
    let KinkyDungeonSpellChoicesToggle: boolean[];
    let KinkyDungeonSpellChoiceCount: number;
    let KinkyDungeonSpellChoiceRenderRows: number;
    let KinkyDungeonSpellChoiceCountPerPage: number;
    let KDSpellPage: number;
    let KinkyDungeonSpellOffset: number;
    let KinkyDungeonSpellChoiceOffset: number;
    let KDPlayerHitBy: any[];
    let KDSchoolColors: {
        Elements: string;
        Conjure: string;
        Illusion: string;
    };
    let KinkyDungeonMiscastPityModifier: number;
    let KinkyDungeonMiscastPityModifierIncrementPercentage: number;
    let KDSpellComponentTypes: Record<string, KDSpellComponent>;
    function KinkyDungeonSearchSpell(list: spell[], name: string): spell;
    let KDSpellMemo: {};
    function KinkyDungeonFindSpell(name: string, SearchEnemies?: boolean): spell;
    function KinkyDungeonDisableSpell(Name: string): void;
    let KinkyDungeonSpellPress: string;
    function KinkyDungeonResetMagic(): void;
    let KDRefreshSpellCache: boolean;
    function KDPushSpell(spell: spell): void;
    let KDSpellCache: Map<any, any>;
    let KDUpcastFromCache: Map<any, any>;
    let KDEventSpells: Map<any, any>;
    function KDUpdateSpellCache(): void;
    function KDHasSpell(name: string): boolean;
    function KDGetUpcast(name: string, Level: number): spell;
    function KDHasUpcast(name: string): boolean;
    function KDCanUpcast(): boolean;
    function KDEmpower(_data: any, _entity: any): void;
    function KinkyDungeoCheckComponentsPartial(spell: spell, x: number, y: number, includeFull: boolean, noOverride?: boolean): string[];
    function KinkyDungeoCheckComponents(spell: spell, x?: number, y?: number, noOverride?: boolean): {
        components: string[];
        failed: string[];
    };
    function KinkyDungeonHandleSpellChoice(SpellChoice: number): spell;
    function KDSpellIgnoreComp(spell: spell, x?: number, y?: number, components?: string[]): boolean;
    function KinkyDungeonHandleSpellCast(spell: spell): spell;
    function KinkyDungeonClickSpell(i: number): {
        spell: any;
        clicked: boolean;
    };
    let KDSwapSpell: number;
    function KinkyDungeonHandleSpell(ind?: number): boolean;
    function KinkyDungeonGetStaminaCost(Spell: spell, Passive?: boolean, Toggle?: boolean): number;
    function KinkyDungeonGetManaCost(Spell: spell, Passive?: boolean, Toggle?: boolean): number;
    function KinkyDungeonGetChargeCost(Spell: spell, Passive?: boolean, Toggle?: boolean): number;
    function KinkyDungeonGetCost(Spell: spell): number;
    function KinkyDungeonMakeNoiseSignal(enemy: entity, mult?: number, hideShockwave?: boolean): entity[];
    function KinkyDungeonMakeNoise(radius: number, noiseX: number, noiseY: number, hideShockwave?: boolean, attachToEntity?: boolean): entity[];
    function KDDoGaggedMiscastFlag(data: any, components: string[]): void;
    function KinkyDungeonCastSpell(targetX: number, targetY: number, spell: spell, enemy: entity, player: any, bullet?: KDBullet, forceFaction?: string, castData?: any): {
        result: string;
        data: any;
    };
    function KinkyDungeonClickSpellChoice(I: number, CurrentSpell: number): void;
    function KinkyDungeonClickItemChoice(I: number, name: string): void;
    function KinkyDungeonHandleMagic(): boolean;
    function KDGetPrerequisite(spell: spell): string;
    function KinkyDungeonCheckSpellPrerequisite(spell: spell): boolean;
    function KinkyDungeonDetectLanguageForMaxWidth(str: string, maxWidthTranslate: number, maxWidthEnglish: number): number;
    function KinkyDungeonWordWrap(str: string, maxWidthTranslate: number, maxWidthEnglish: number): string;
    function KinkyDungeonTestWhite(x: string, language: string): boolean;
    function KDSchoolColor(school: string): string;
    function KinkyDungeonDrawMagic(): void;
    let selectedFilters: string[];
    let genericfilters: string[];
    let KDSpellListIndex: number;
    let KDSpellListIndexVis: number;
    let KDMaxSpellPerColumn: number;
    let KDMaxSpellYY: number;
    function KDFilterSpellPages(): any[];
    function KDFilterSpellPageNames(): any[];
    let KDMagicFilter: string;
    function KDFilterSpell(spell: spell): boolean;
    function KinkyDungeonListSpells(Mode: string): spell;
    let MagicSpellsUIShift: number;
    function KinkyDungeonDrawMagicSpells(): void;
    function KinkyDungeonHandleMagicSpells(): boolean;
    function KinkyDungeonSpellIndex(Name: string): number;
    function KinkyDungeonSetPreviewSpell(spell: spell): void;
    function KinkyDungeonGetCompList(spell: spell): string;
    function KinkyDungeonSendMagicEvent(Event: string, data: any, forceSpell?: spell): void;
    function KDCastSpellToEnemies(fn: (en: entity) => boolean, tX: number, tY: number, spell: spell): boolean;
    function KDMatchTags(tags: string[], entity: entity): boolean;
    function KinkyDungeonLoadSpellsConfig(): void;
    function KinkyDungeonSaveSpellsConfig(): void;
    function KDDrawHotbar(xLoc: number, _yLoc: number, _name: string, _fn: (I: number) => void): void;
    function KDClearChoices(): void;
    function KDGetRandomSpell(maxSpellLevel?: number): any;
    function KinkyDungeonGetUnlearnedSpells(minlevel: number, maxlevel: number, SpellList: spell[]): spell[];
    function KinkyDungeonSpellChoiceAssign(spell: spell | string, hotbarslot?: number): void;
    function KinkyDungeonSpellChoiceUnassign(spell: spell | string): void;
    function KinkyDungeonSpellAdd(spellobject: spell | string, index?: number): boolean;
    function KinkyDungeonSpellRemove(spellobject: spell | string): void;
    function KDShockCollarCost(): number;
    function KDCurrIndex(): string;
    type KDSpellSpecialCode = (spell: spell, data: any, targetX: number, targetY: number, tX: number, tY: number, entity: entity, enemy: entity, moveDirection: MoveDirection, bullet: any, miscast: boolean, faction: string, cast: any, selfCast: boolean) => void | string;
    let KinkyDungeonSpellSpecials: Record<string, KDSpellSpecialCode>;
    let KDCommandCaptureBindings: Record<string, (spell: spell, entity: entity, faction: string, bullet: any, miscast: any, attacker: entity, counter: number) => void>;
    let KDCommandBindBindings: Record<string, (spell: spell, x: number, y: number, faction: string, bullet: any, miscast: any, attacker: entity, counter?: number) => void>;
    function KDRescueSlime(en: entity, rescuer: entity): void;
    function KDEssenceMoteDuration(): number;
    function KDAddEssenceMoteDP(): void;
    let KDCommandWord: spell;
    let KDBondageSpell: spell;
    let KDZeroResistanceSpell: spell;
    let KinkyDungeonSpellsStart: spell[];
    let filters: string[];
    let filtersExtra: string[][];
    let KDColumnLabels: string[][];
    let KinkyDungeonSpellPages: string[];
    let KinkyDungeonSpellPagesDefault: {
        All: boolean;
        Upgrade: boolean;
        Class: boolean;
        Upgrades: boolean;
        Elements: boolean;
        Conjure: boolean;
        Illusion: boolean;
    };
    let KDSpellColumns: {};
    function KDAddSpellPage(page: string, columnLabels?: string[]): void;
    let KinkyDungeonLearnableSpells: string[][][];
    function KDDefineSpellPage(page: string, list: string[][]): void;
    let KinkyDungeonSpellList: Record<string, spell[]>;
    let KinkyDungeonSpellListEnemies: spell[];
    let KDSpecialBondage: Record<string, KDBondage>;
    let KDMagicDefs: {
        RopeKraken_TentacleCost: number;
        RopeKraken_TentacleThreshold: number;
        RopeKraken_TentacleCountMin: number;
        RopeKraken_TentacleCountShare: number;
        SarcoKraken_TentacleCost: number;
        SarcoKraken_TentacleThreshold: number;
        SarcoKraken_TentacleCountMin: number;
        SarcoKraken_TentacleCountMax: number;
        SarcoKraken_TentacleCountShare: number;
        SlimeKraken_TentacleCost: number;
        SlimeKraken_TentacleThreshold: number;
        SlimeKraken_TentacleCountMin: number;
        SlimeKraken_TentacleCountShare: number;
    };
    let KDCastConditions: Record<string, (enemy: entity, target: entity, spell?: spell) => boolean>;
    let KDPlayerCastConditions: Record<string, (player: entity, x: number, y: number) => boolean>;
    let KDCustomCost: Record<string, (data: any) => void>;
    let KDPlayerEffects: Record<string, (target: any, damage: string, playerEffect: any, spell: spell, faction: string, bullet: any, entity: entity) => {
        sfx: string;
        effect: boolean;
    }>;
    function KDPlayerEffectRestrain(spell: any, count: number, tags: string[], faction: string, _noDeep?: boolean, bypass?: boolean, allowEvade?: boolean, allowBlock?: boolean, allowBondageResist?: boolean, Lock?: string, options?: any): {
        r: restraint;
        v: ApplyVariant;
        iv: string;
    }[];
    function KDTestSpellHits(spell: spell, allowEvade?: number, allowBlock?: number): boolean;
    function KinkyDungeonPlayerEffect(target: any, damage: string, playerEffect: any, spell?: spell, faction?: string, bullet?: any, entity?: entity): boolean;
    function KDTripleBuffKill(Name: string, Target: entity, time: number, FinalEffect?: (target: entity) => void, buffType?: string, FirstEffect?: (target: entity) => void, SecondEffect?: (target: entity) => void, ThirdEffect?: (target: entity) => void): void;
    function KDAdvanceSlime(resetSlimeLevel: boolean, restraint?: string): boolean;
    function KDApplyBubble(entity: entity, time: number, damage?: number): void;
    let KDSpecialStats: Record<string, SpecialStat>;
    function KDAddSpecialStat(stat: string, entity: entity, amount: number, Msg: boolean, max?: number, color?: string): void;
    let KinkyDungeonShrineBaseCosts: Record<string, number>;
    let KDRewardProgramScaling: number;
    let KDRewardProgramBase: number;
    let KDWillShrineWill: number;
    let KinkyDungeonOrbAmount: number;
    let KDShrineRemoveCount: number;
    let KDMaxGoddessBonus: number;
    let KDMinGoddessBonus: number;
    let KinkyDungeonShrineBaseCostGrowth: Record<string, number>;
    let KinkyDungeonShopIndex: number;
    let KinkyDungeonShrinePoolChancePerUse: number;
    let KinkyDungeonShrineCosts: Record<string, number>;
    let KinkyDungeonShrineTypeRemove: string[];
    function KinkyDungeonShrineInit(): void;
    function KDGoddessColor(Name: string): string;
    function KinkyDungeonShrineAvailable(type: string): boolean;
    let KDLevelsPerCheckpoint: number;
    function KinkyDungeonGenerateShop(Level: number): any[];
    function KinkyDungeonItemCost(item: any, noScale?: boolean, sell?: boolean): number;
    function KinkyDungeonShrineCost(type: string): number;
    function KDAddBasic(item: item | shopItem): void;
    function KinkyDungeonPayShrine(type: string, mult?: number): void;
    function KinkyDungeonHandleShrine(): boolean;
    function KinkyDungeonDrawShrine(): void;
    let KDGoddessRevengeMobTypes: Record<string, {
        require: string[];
        requireSingle: string[];
        filter?: string[];
    }>;
    function KDSummonRevengeMobs(_x: number, _y: number, Goddess: string, mult?: number, LevelBoost?: number): number;
    function KDCanDrinkShrine(Bottle: boolean): boolean;
    function KinkyDungeonGetSetPieces(Dict: any): any[];
    function KinkyDungeonGetMapShrines(Dict: any): any[];
    function KinkyDungeonTakeOrb(Amount: number, X: number, Y: number): void;
    function KinkyDungeonDrawOrb(): void;
    let KDOrbX: number;
    let KDOrbY: number;
    function KinkyDungeonHandleOrb(): boolean;
    let KDPerkConfirm: boolean;
    let KDPerkOrbPerks: any[];
    let KDPerkOrbBondage: any[];
    let KDPerkOrbMethod: string;
    function KinkyDungeonTakePerk(Amount: number, X: number, Y: number): void;
    function KinkyDungeonDrawPerkOrb(): void;
    function KDGetPosNegColor(value: number): string;
    function KDGetGoddessBonus(shrine: string): number;
    function KDDrawRestraintBonus(shrine: string, x: number, y: number, width?: number, FontSize?: number, align?: string, zIndex?: number, alpha?: number, forceColor?: string): void;
    function KDGetShrineQuest(map: KDMapDataType, tile: any): string;
    function KDSetShrineQuest(map: KDMapDataType, tile: any, quest: string): void;
    let TileTypeTooltipOverride: {
        Trap: {
            DisplayStandTrap: string;
            DisplayTrap: string;
            CageTrap: string;
            FutureBoxTrap: string;
            DisplayEgyptianTrap: string;
            BedTrap: string;
        };
        Furniture: {
            LatexDisplayStand: string;
            DisplayStand: string;
            DisplayEgyptian: string;
            Cage: string;
            Barrel: string;
            Bed: string;
            FutureBox: string;
            Sarcophagus: string;
            IceBase: string;
            CrystalBase: string;
            ShadowBase: string;
            VineBase: string;
        };
    };
    let ObjectTypeTooltipOverride: {
        Trap: {
            DisplayStandTrap: string;
            DisplayTrap: string;
            CageTrap: string;
            FutureBoxTrap: string;
            DisplayEgyptianTrap: string;
            BedTrap: string;
        };
    };
    let KDObjectMessages: Record<string, () => boolean>;
    let KDObjectClick: Record<string, (x: number, y: number) => boolean>;
    let KDObjectInteract: Record<string, (x: number, y: number, dist?: number) => boolean>;
    let KDTileInteract: Record<string, (x: number, y: number, dist?: number) => boolean>;
    let KDObjectHandle: Record<string, () => boolean>;
    let KDObjectDraw: Record<string, () => void>;
    function KinkyDungeonDrawDoor(): void;
    function KinkyDungeonDrawLock(): void;
    function KinkyDungeonDrawGhost(): void;
    function KinkyDungeonDrawAngel(): void;
    function KinkyDungeonElevatorMessage(): boolean;
    function KinkyDungeonGhostMessage(): boolean;
    function KinkyDungeonAngelMessage(): boolean;
    function KinkyDungeonFoodMessage(Tile?: any): boolean;
    function KinkyDungeonMakeGhostDecision(): void;
    function KinkyDungeonDrawCharger(): void;
    function KinkyDungeonDrawTablet(): void;
    function KinkyDungeonDrawFood(): void;
    let KDChargerLight: number;
    let KDChargerColor: number;
    let KDLeylineLightColor: number;
    let KDLeylineLight: number;
    function KinkyDungeonHandleCharger(): boolean;
    function KDHandleModalArea(): boolean;
    let KDAlwaysUnlockedElevFloors: {
        Summit: boolean;
    };
    let KDElevatorFloorIndex: {
        Summit: {
            Floor: number;
            RoomType: string;
            MapMod: any;
            Checkpoint: string;
            MapFaction: string;
            EscapeMethod: string;
        };
    };
    function KDIsElevatorFloorUnlocked(num: string | number): boolean;
    function KDElevatorToFloor(floor: number, RoomType: string, x?: number): void;
    let KDBuyableStats: string[];
    let KDStat: {
        AP: {
            getMax: (_player: any) => number;
            getCurrent: (_player: any) => number;
        };
        SP: {
            getMax: (_player: any) => number;
            getCurrent: (_player: any) => number;
        };
        MP: {
            getMax: (_player: any) => number;
            getCurrent: (_player: any) => number;
        };
        WP: {
            getMax: (_player: any) => number;
            getCurrent: (_player: any) => number;
            getAmnt2: (amnt: number) => number;
        };
    };
    let KDStatChoice: string;
    function KDDrawHeartTablet(): void;
    function KDDrawOrb(): void;
    function KDGetGhostThresh(): number;
    let KDDroppedItemProperties: Record<string, KDDroppedItemProp>;
    type GroundItem = {
        x: number;
        y: number;
        name: string;
        amount?: number;
    };
    function KinkyDungeonItemDrop(x: number, y: number, dropTable: any[], summoned: boolean): boolean | GroundItem;
    function KinkyDungeonDropItem(Item: any, Origin: any, PreferOrigin: boolean, noMsg?: boolean, allowEnemies?: boolean): boolean;
    function KinkyDungeonItemEvent(Item: any, nomsg?: boolean): boolean;
    function KDAllowUseItems(Message: boolean, _x?: number, _y?: number): boolean;
    function KinkyDungeonItemCheck(x: number, y: number, _Index: number, autoEquip?: boolean): void;
    function KDCanSeeDroppedItem(item: GroundItem): boolean;
    function KDGetItemType(item: Named): string;
    function KinkyDungeonDrawItems(_canvasOffsetX: number, _canvasOffsetY: number, CamX: number, CamY: number): void;
    function KinkyDungeonDrawHeart(): void;
    function KinkyDungeonHandleHeart(): boolean;
    let KDCustomItems: {
        LeylineMap: () => {
            sfx: any;
            replace: any;
            priority: any;
            color: any;
        };
    };
    function KDDrawItemsTooltip(items: any[], offset: number): number;
    let KDNaughtySetting: boolean;
    let KinkyDungeonOutfitCache: Map<any, any>;
    let KDProtectedCosplay: string[];
    function KDOutfit(item: Named): outfit;
    function KinkyDungeonRefreshOutfitCache(): void;
    let KDClothOverrides: Record<string, Record<string, number>>;
    let KinkyDungeonDefaultDefaultDress: KinkyDungeonDress;
    let KinkyDungeonCheckClothesLoss: boolean;
    function KDGetDressList(): {
        [_: string]: KinkyDungeonDress;
    };
    function KinkyDungeonInitializeDresses(): void;
    let KinkyDungeonNewDress: boolean;
    function KinkyDungeonDressSet(C?: Character): void;
    let KDCharacterDress: Map<any, any>;
    function KinkyDungeonSetDress(Dress: string, Outfit?: string, Character?: Character, NoRestraints?: boolean): void;
    let KDNaked: boolean;
    let KDRefresh: boolean;
    let KDLastForceRefresh: number;
    let KDLastForceRefreshInterval: number;
    function KinkyDungeonDressPlayer(Character?: Character, NoRestraints?: boolean, Force?: boolean, npcRestraints?: Record<string, NPCRestraint>, customInventory?: item[], customPlayerTags?: Map<string, boolean>, customFaction?: string, noDressOutfit?: boolean, forceUseOutfit?: boolean): void;
    let KDRefreshCharacter: Map<any, any>;
    function KDInitProtectedGroups(C: Character): void;
    function KinkyDungeonWearForcedClothes(C: Character, restraints?: item[], extraForceDress?: alwaysDressModel[], customFaction?: string, forceCustomFaction?: boolean): void;
    function KDCharacterAppearanceSetColorForGroup(Player: Character, Color: ItemColor, Group: string): void;
    function KinkyDungeonGetOutfit(Name: string): any;
    function KDInventoryWear(Character: Character, AssetName: string, AssetGroup: string, _par?: string, color?: ItemColor, filters?: Record<string, LayerFilter>, Properties?: Record<string, LayerPropertiesType>, factionFilters?: Record<string, FactionFilterDef>): Item;
    function KDCharacterNaked(Character: Character): void;
    function KDCharacterAppearanceNaked(C: Character): void;
    function KDApplyItem(C: Character, inv: item, tags: any, customFaction?: string, forceCustomFaction?: boolean): void;
    function KinkyDungeonSendOutfitEvent(Event: string, data: any): void;
    function KDGetExtraPoses(C: Character): string[];
    function KDGetEntityFlags(C: Character): Map<string, number>;
    function KDUpdateTempPoses(Character: Character): void;
    function KDGetPalettes(C: Character, safe?: boolean, includeDefault?: boolean, defaultOverride?: Record<string, Record<string, LayerFilter>>): Record<string, Record<string, LayerFilter>>;
    function GetPalette(C: Character, palette: string, safeChar?: boolean, safeMain?: boolean): Record<string, LayerFilter>;
    function KDGetFactionFilters(faction: string): Record<string, LayerFilter>;
    function KinkyDungeonHeadpatModal(): void;
    let KDDefaultRestraintPaletteThreshold: number;
    function KDGetRestraintsPalette(C: Character): string;
    function KDGetPlayerPalette(C: Character): string;
    function KDGetMapData(coord: WorldCoord): KDMapDataType;
    function KDCoordToPoint(coord: {
        mapX: number;
        mapY: number;
    }): KDPoint;
    function KDGetEntrancePoints(map: WorldCoord, includeShortcuts?: boolean, includeStart?: boolean, includeEnd?: boolean): Record<string, KDPoint>;
    function KDGetEntrancesInRoom(map: WorldCoord, includePotential?: boolean, includeShortcuts?: boolean, includeStart?: boolean, includeEnd?: boolean): Record<string, boolean>;
    let KDCustomExp: Record<number, KDExpressionType>;
    let KDExpressionPoses: string[];
    let KDExpressions: Record<string, KDExpression>;
    interface KDPersistentNPC {
        Name: string;
        id: number;
        entity: entity;
        trueEntity?: entity;
        mapX: number;
        mapY: number;
        room: string;
        captured: boolean;
        captureFaction?: string;
        captureCaptor?: number;
        collect: boolean;
        opinion: number;
        jailed?: boolean;
        special?: boolean;
        permanent?: boolean;
        alwaysEscape?: boolean;
        wanderAI?: string;
        spawnAI?: string;
        specialScript?: string;
        outfit?: string;
        hairstyle?: string;
        bodystyle?: string;
        facestyle?: string;
        cosplaystyle?: string;
        metadata?: KDOutfitMetadata;
        Palette?: string;
        storedParty?: entity[];
        persistentParty?: number[];
        partyLeader?: number;
        spawned?: boolean;
        fromType?: number;
        fromIndex?: string;
        nextWanderTick?: number;
        nextSpawnTick?: number;
        nextScriptTick?: number;
        data?: PersistentNPCData;
    }
    interface PersistentNPCData {
        wanderTarget?: WorldCoord;
        MaidKnightHeavyID?: number;
        MaidKnightLightID?: number;
    }
    function KDPersistentAddData(id: number, key: string, data: any): boolean;
    function KDPersistentGetData(id: number, key: string): any;
    interface WorldCoord {
        mapX: number;
        mapY: number;
        room: string;
    }
    function KDGetEnemyStoredParty(partyid: number): entity[];
    function KDGetEnemyPersistentParty(partyid: number): entity[];
    function KDGetEnemyStoredPartyIDs(partyid: number): number[];
    function KDGetEnemyPersistentPartyIDs(partyid: number): number[];
    function KDGetEnemyParty(partyid: number): entity[];
    function KDGetEnemyPartyIDs(partyid: number): number[];
    function KDNPCInParty(pmid: number, partyid: number): boolean;
    function KDStoreEnemyPartyMember(enemy: entity, partyid: number, location?: WorldCoord): boolean;
    function KDPopEnemyPartyMember(pmid: number, partyid: number, freeFromParty?: boolean): entity;
    function KDDespawnParty(partyid: number, mapData: KDMapDataType): void;
    function KDChangeParty(pmid: number, partyid: number): boolean;
    function KDIsPartyLeaderCapturedOrGone(partyid: number): boolean;
    function KDIsInEnemyParty(entity: entity): boolean;
    function KDPurgeParty(partyid: number): void;
    function KDPersistentWatch(): void;
    function KDWatchMainPersistent(): void;
    function KDMakePersistent(e: entity, custom: any, special?: boolean): void;
    function KDPurgePartyGlobal(pid: number): void;
    function KDGetPartyOnLevel(partyid: number, spawnedOnly: boolean): entity[];
    function KDGetPartyAtCoord(partyid: number, spawnedOnly: boolean, coord: WorldCoord): entity[];
    function KDMovePersistentNPC(id: number, coord: WorldCoord): boolean;
    function coordHash(coord: WorldCoord): string;
    let KDPersistentNPCs: {
        [_: string]: KDPersistentNPC;
    };
    let KDDeletedIDs: {
        [_: string]: number;
    };
    function KDGetPersistentNPCCache(coord: WorldCoord): number[];
    function KDGetPersistentNPCInlevel(coord: WorldCoord): number[];
    function KDUpdatePersistentNPC(id: number, force?: boolean): void;
    function KDRefreshPersistentNPC(id: number): void;
    function KDGetGlobalEntity(id: number): entity;
    function KDIsNPCPersistent(id: number): boolean;
    function KDGetPersistentNPC(id: number, entity?: entity, force?: boolean, location?: WorldCoord, special?: boolean): KDPersistentNPC;
    function KDGetCurrentLocation(): WorldCoord;
    function KDGetNPCLocation(id: number): WorldCoord;
    function KDCompareLocation(loc1: WorldCoord, loc2: WorldCoord): boolean;
    function KDCheckBrokenDespawned(): void;
    function KDRepopulatePersistentNPCs(): void;
    function KDSpawnPersistentNPCs(coord: WorldCoord, searchEntities: boolean): number[];
    function KDRunPersistentNPCScripts(coord: WorldCoord, searchEntities: boolean): number[];
    function KDWanderPersistentNPCs(coord: WorldCoord, searchEntities: boolean): number[];
    function KDGetCapturedPersistent(Level: number, RoomType: string, MapMod: string, faction: string, sameLocation?: boolean): KDPersistentNPC[];
    function KDSetSpawnAndWanderAI(npc: KDPersistentNPC, customSpawnAI: string, customWanderAI: string): void;
    function KDSetSpecialScript(npc: KDPersistentNPC, specialScript: string): void;
    function KDNPCCanWander(id: number): boolean;
    function KDGetSideroomWanderTags(slot: KDWorldSlot): Record<string, Record<string, number>>;
    function KDGetLairWanderTags(roomFilter: string, slot: KDWorldSlot): Record<string, Record<string, number>>;
    function KDGetWeightedAvgWithTags(tags: Record<string, number>, rooms: Record<string, Record<string, number>>): Record<string, number>;
    function KDGetPersistentWanderWeightsForRoom(AITags: Record<string, number>, coord: WorldCoord, includeMain?: boolean): Record<string, number>;
    interface PersistentSpawnAI {
        cooldown: number;
        filter: (id: number, mapData: KDMapDataType) => boolean;
        chance: (id: number, mapData: KDMapDataType) => number;
        doSpawn: (id: number, mapData: KDMapDataType, entity?: entity) => boolean;
    }
    let KDPersistentSpawnAIList: Record<string, PersistentSpawnAI>;
    interface PersistentWanderAI {
        cooldown: number;
        filter: (id: number, mapData: KDMapDataType) => boolean;
        chance: (id: number, mapData: KDMapDataType) => number;
        doWander: (id: number, mapData: KDMapDataType, entity: entity) => boolean;
    }
    let KDPersistentWanderAIList: Record<string, PersistentWanderAI>;
    function KDStandardWander(id: number, mapData: KDMapDataType, entity: entity, AITagFunc: () => Record<string, number>): boolean;
    function KDStandardLairWander(id: number, mapData: KDMapDataType, entity: entity, modeAlternate: boolean, duration: number, AITagFunc: () => Record<string, number>): boolean;
    function KDStandardTargetedWander(id: number, mapData: KDMapDataType, entity: entity, modeAlternate: boolean, target: WorldCoord, AITagFunc: () => Record<string, number>): boolean;
    interface PersistentNPCScript {
        cooldown: number;
        filter: (id: number, mapData: KDMapDataType) => boolean;
        chance: (id: number, mapData: KDMapDataType) => number;
        doScript: (id: number, mapData: KDMapDataType, entity: entity) => boolean;
    }
    let KDPersistentScriptList: Record<string, PersistentNPCScript>;
    let KDLatexDmg: number;
    let KDLatexBind: number;
    let KDBubbleDmg: number;
    let KDEffectTiles: Record<string, effectTile>;
    let KinkyDungeonOutfitsBase: outfit[];
    let KinkyDungeonDresses: Record<string, KinkyDungeonDress>;
    interface ItemEffect {
        name: string;
        range?: number;
        components: string[];
        onUse: (item: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => ItemEffectResult;
        onMiscast: (result: ItemEffectResult, item: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => ItemEffectResult;
        onFailure: (result: ItemEffectResult, item: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => ItemEffectResult;
        canAttempt: (item: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => boolean;
        onAttempt: (item: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => ItemAttemptResult;
        delayedTags?: string[];
    }
    interface ItemEffectResult {
        success: boolean;
        componentfailure: string;
        miscast: boolean;
        affected: entity[];
        consumed: number;
        time: number;
    }
    interface ItemAttemptResult {
        success: boolean;
        componentfailure: string;
        failureChance: number;
        miscastChance: number;
        miscast: boolean;
        time: number;
        delayed?: boolean;
        quantity: number;
    }
    function KDConsumable(item: Named): consumable;
    function KinkyDungeonFindConsumable(Name: string): consumable;
    function KinkyDungeonFindBasic(Name: string): any;
    function KinkyDungeonFindConsumableOrBasic(Name: string): consumable | any;
    function KinkyDungeonGetInventoryItem(Name: string, Filter?: string): itemPreviewEntry;
    function KinkyDungeonItemCount(Name: string): number;
    function KinkyDungeonGetShopItem(_Level: number, Rarity: number, _Shop: boolean, ShopItems: any[], uniqueTags?: Record<string, boolean>): any;
    interface KDChangeConsumableData {
        src: string;
        type: string;
        trig: string;
        item: item;
        consumable: consumable;
        Quantity: number;
        container?: KDContainer;
        cancel: boolean;
    }
    function KDChangeConsumable(src: string, type: string, trig: string, consumable: consumable, Quantity: number, container?: KDContainer): boolean;
    function KinkyDungeonChangeConsumable(consumable: consumable, Quantity: number, container?: KDContainer): boolean;
    function KDAddConsumable(name: string, Quantity: number, container?: KDContainer): boolean;
    function KinkyDungeonConsumableEffect(Consumable: consumable, type: string, inv: item): void;
    function KinkyDungeonConsumableEffectNPC(Consumable: consumable, entity: entity, type: string, inv: item): void;
    function KinkyDungeonPotionCollar(): boolean;
    function KinkyDungeonCanDrink(byEnemy?: boolean, strict?: boolean): boolean;
    function KinkyDungeonAttemptConsumable(Name: any, Quantity: number, target?: entity, tx?: number, ty?: number): boolean;
    function KinkyDungeonUseConsumable(Name: string, Quantity: number): boolean;
    function KDGetCheapestLatexSolvent(tag?: string): string;
    let KDItemEffects: Record<string, ItemEffect>;
    function KDGetGagMult(Consumable: consumable, entity: entity, msg: boolean): {
        gagFloor: number;
        gagMult: number;
    };
    function KDTargetConsumable(inv: item, Quantity: number, itemEffect?: string): ItemEffectResult;
    function KDStandardConsumableHandsCheck(item: item, Quantity: number): boolean;
    interface KDInventoryMaxData {
        item: item;
        max: number;
        bonus: number;
        mult: number;
        entity: entity;
    }
    function KDGetItemBaseMax(item: item): number;
    function KDMaxInventoryStorage(item: item, entity: entity): number;
    let KDMaxRarity: number;
    let KinkyDungeonConsumables: Record<string, consumable>;
    let KDCookies: Record<string, consumable>;
    let KDRechargeCost: number;
    let KDSellCriteria: {
        Keyring: (seller: entity) => boolean;
    };
    let KinkyDungneonBasic: {
        Key: {
            name: string;
            rarity: number;
            shop: boolean;
        };
        Keyring: {
            name: string;
            rarity: number;
            shop: boolean;
        };
        RedKey: {
            name: string;
            rarity: number;
            shop: boolean;
        };
        BlueKey: {
            name: string;
            rarity: number;
            costMod: number;
            shop: boolean;
        };
        "3Bola": {
            name: string;
            consumable: string;
            quantity: number;
            rarity: number;
            shop: boolean;
        };
        "3Bomb": {
            name: string;
            consumable: string;
            quantity: number;
            rarity: number;
            shop: boolean;
        };
        "2Dynamite": {
            name: string;
            consumable: string;
            quantity: number;
            rarity: number;
            shop: boolean;
        };
        "2C4": {
            name: string;
            consumable: string;
            quantity: number;
            rarity: number;
            shop: boolean;
        };
        "3Flash": {
            name: string;
            consumable: string;
            quantity: number;
            rarity: number;
            shop: boolean;
        };
        "3Flashbang": {
            name: string;
            consumable: string;
            quantity: number;
            rarity: number;
            shop: boolean;
        };
        "3Smoke": {
            name: string;
            consumable: string;
            quantity: number;
            rarity: number;
            shop: boolean;
        };
        MaidUniform: {
            name: string;
            outfit: string;
            rarity: number;
            shop: boolean;
            ignoreInventory: string;
            uniqueTags: string[];
        };
        Bast: {
            name: string;
            outfit: string;
            rarity: number;
            shop: boolean;
            ignoreInventory: string;
            uniqueTags: string[];
        };
        Bountyhunter: {
            name: string;
            outfit: string;
            rarity: number;
            shop: boolean;
            ignoreInventory: string;
            uniqueTags: string[];
        };
        Dragon: {
            name: string;
            outfit: string;
            rarity: number;
            shop: boolean;
            ignoreInventory: string;
            uniqueTags: string[];
        };
        BlueSuit: {
            name: string;
            outfit: string;
            rarity: number;
            shop: boolean;
            ignoreInventory: string;
            uniqueTags: string[];
        };
        Elven: {
            name: string;
            outfit: string;
            rarity: number;
            shop: boolean;
            ignoreInventory: string;
            uniqueTags: string[];
        };
        ElementalDress: {
            name: string;
            outfit: string;
            rarity: number;
            shop: boolean;
            ignoreInventory: string;
            uniqueTags: string[];
        };
    };
    let KinkyDungneonShopRestraints: {
        SlimeWalkers: {
            name: string;
            rarity: number;
            shop: boolean;
        };
        SarielPanties: {
            name: string;
            rarity: number;
            shop: boolean;
        };
        ElvenPanties: {
            name: string;
            rarity: number;
            shop: boolean;
        };
        DivineBelt: {
            name: string;
            rarity: number;
            shop: boolean;
            uniqueTags: string[];
        };
        DivineBelt2: {
            name: string;
            rarity: number;
            shop: boolean;
            uniqueTags: string[];
        };
        DivineBra: {
            name: string;
            rarity: number;
            shop: boolean;
            uniqueTags: string[];
        };
        DivineBra2: {
            name: string;
            rarity: number;
            shop: boolean;
            uniqueTags: string[];
        };
        DusterGag: {
            name: string;
            rarity: number;
            shop: boolean;
        };
        GasMask: {
            name: string;
            rarity: number;
            shop: boolean;
        };
        PotionCollar: {
            name: string;
            rarity: number;
            shop: boolean;
        };
        Sunglasses: {
            name: string;
            rarity: number;
            shop: boolean;
            uniqueTags: string[];
        };
        Sunglasses2: {
            name: string;
            rarity: number;
            shop: boolean;
            uniqueTags: string[];
        };
    };
    let KDConsumableEffects: Record<string, (Consumable: consumable, entity: entity, inv: item) => void>;
    let KDConsumablePrereq: Record<string, (item: item, Quantity: number) => boolean>;
    let KDBasicPotionFields: {
        onMiscast: (result: ItemEffectResult, inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => ItemEffectResult;
        onFailure: (result: ItemEffectResult, inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => ItemEffectResult;
        canAttempt: (inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => boolean;
        onAttempt: (inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => ItemAttemptResult;
    };
    interface PotionEffect {
        playerEffect: (inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => ItemEffectResult;
        entityEffect: (inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => ItemEffectResult;
        tileEffect: (inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => ItemEffectResult;
    }
    function KDGetPotionRange(item: item, itemEffect: string): number;
    function KDPotionOnUse(itemEffect: string, inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number, playerEffect: (inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => ItemEffectResult, entityEffect: (inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => ItemEffectResult, tileEffect: (inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => ItemEffectResult): ItemEffectResult;
    function KDCanAttemptPotion(inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number): boolean;
    function KDAttemptPotion(inv: item, quantity: number, user: entity, target: entity, tx: number, ty: number): ItemAttemptResult;
    let KDPotionTypes: Record<string, PotionEffect>;
    let KDPotionActions: Record<string, ItemEffect>;
    let KDAlternateInventoryScreens: {
        [_: string]: (selected: KDFilteredInventoryItem, xOffset: number, yOffset: number, prefix: string) => boolean;
    };
    let KDCurrentAlternateInventory: string;
    function KDRenderAlternateInventory(selected: KDFilteredInventoryItem, xOffset: number, yOffset: number, prefix: string): boolean;
    let KDPreventAccidentalClickTime: number;
    let KDInventoryActionSpacing: number;
    let KDInventoryActionPerRow: number;
    let KinkyDungeonFilters: string[];
    let KDInventoryActionsDefault: Record<string, (item: item) => string[]>;
    let KDConfigHotbar: boolean;
    let KDConfigRestraintColor: boolean;
    let KDWeaponTags: {
        magic: boolean;
        light: boolean;
        bow: boolean;
        noHands: boolean;
        clumsy: boolean;
        offhand: boolean;
        shield: boolean;
        heavy: boolean;
        massive: boolean;
        illum: boolean;
    };
    let KDInvFilter: string;
    let KDFilterTransform: {
        armor: string;
    };
    let KinkyDungeonRestraintVariants: Record<string, KDRestraintVariant>;
    let KinkyDungeonWeaponVariants: Record<string, KDWeaponVariant>;
    let KinkyDungeonConsumableVariants: Record<string, KDConsumableVariant>;
    function KDGetRestraintVariant(item: item): KDRestraintVariant;
    function KDGetConsumableVariant(item: item): KDConsumableVariant;
    function KDGetWeaponVariant(item: item): KDWeaponVariant;
    let KDInventoryUseIconConfig: Record<string, boolean>;
    let KDFilterIndex: Record<string, number>;
    let KDMaxFilters: number;
    let KDFilterFilters: Record<string, Record<string, boolean>>;
    let KDSpecialFilters: Record<string, Record<string, (item: item, handle: boolean) => boolean>>;
    let KinkyDungeonCurrentFilter: string;
    let KinkyDungeonCurrentPageInventory: number;
    let KinkyDungeonShowInventory: boolean;
    let KinkyDungeonInventoryOffset: number;
    let KinkyDungeonContainerOffset: number;
    let KDConfirmOverInventoryAction: boolean;
    function KDCloseQuickInv(): void;
    function KDRestraintSpecial(item: Named): boolean;
    let KDWeaponSwitchPref: number;
    function KDSwitchWeapon(weapon?: string, pref?: number, container?: KDContainer): void;
    function KinkyDungeonHandleInventory(): boolean;
    function KinkyDungeonInventoryAddWeapon(Name: string, container?: KDContainer): void;
    function KinkyDungeonInventoryAddLoose(Name: string, UnlockCurse?: string, faction?: string, quantity?: number, container?: KDContainer): void;
    function KinkyDungeonInventoryAddOutfit(Name: string, container?: KDContainer): void;
    function KDInvAddWeapon(container: KDContainer | null, Name: string): void;
    function KDInvAddLoose(container: KDContainer | null, Name: string, UnlockCurse?: string, faction?: string, quantity?: number): void;
    function KDInventoryType(item: item): string;
    function KinkyDungeonFullInventory(): any[];
    function KinkyDungeonFullLooseInventory(): any[];
    function KinkyDungeonFullLooseInventoryKeepOutfit(): any[];
    function KinkyDungeonInventoryLength(): number;
    function KinkyDungeonInventoryAdd(item: item, container?: KDContainer): void;
    function KDInvAdd(container: KDContainer | null, item: item): void;
    function KinkyDungeonInventoryRemove(item: item, container?: KDContainer): void;
    function KinkyDungeonInventoryRemoveSafe(item: item, container?: KDContainer): void;
    function KinkyDungeonInventoryGet(Name: string, container?: KDContainer): item | null;
    function KinkyDungeonInventoryGetSafe(Name: string, container?: KDContainer): item | null;
    function KinkyDungeonInventoryGetLoose(Name: string, container?: KDContainer): item | null;
    function KinkyDungeonInventoryGetWorn(Name: string): item | null;
    function KinkyDungeonInventoryGetConsumable(Name: string, container?: KDContainer): item | null;
    function KinkyDungeonInventoryGetWeapon(Name: string, container?: KDContainer): item | null;
    function KinkyDungeonInventoryGetOutfit(Name: string, container?: KDContainer): item | null;
    function KinkyDungeonAllRestraint(): item[];
    function KDAllInventorySafe(): item[];
    function KinkyDungeonAllRestraintDynamic(): {
        item: item;
        host: item;
    }[];
    function KDAllRestraintDynamicList(): item[];
    function KinkyDungeonAllLooseRestraint(): item[];
    function KinkyDungeonAllConsumable(): item[];
    function KinkyDungeonAllOutfit(): item[];
    function KinkyDungeonAllWeapon(): item[];
    type itemPreviewEntry = {
        name: string;
        item: item;
        preview: string;
        preview2?: string;
        previewcolor?: string;
        previewcolorbg?: string;
        key?: string;
    };
    function KDGetItemPreview(item: item): itemPreviewEntry;
    function KDGetGroupPreviewImage(Group: string): string;
    function KDGetRestraintPreviewImage(restraint: restraint): string;
    function KinkyDungeonFilterInventory(Filter: string, enchanted?: boolean, ignoreHidden?: boolean, ignoreFilters?: boolean, click?: string, namefilter?: string, overrideInventory?: Record<string, item>, ignoreFilterList?: string[]): itemPreviewEntry[];
    function KinkyDungeonDrawInventorySelected(item: {
        name: any;
        item: item;
        preview: string;
        preview2?: string;
        key?: string;
    }, noscroll?: boolean, _treatAsHover?: boolean, xOffset?: number): boolean;
    let KDInventoryDrawContainerHotkeys: {
        Chest: {
            up: () => string;
            down: () => string;
            left: () => string;
            right: () => string;
        };
    };
    let KinkyDungeonCurrentPageContainer: number;
    function KDDrawInventoryContainer(xOffset: number, yOffset: number, filteredInventory: KDFilteredInventoryItem[], filter: string, CurrentFilter: string, itemcallback?: (item: KDFilteredInventoryItem, x: number, y: number, w: number, h: number, different: boolean) => void, colorcallback?: (item: KDFilteredInventoryItem) => string, prefix?: string, nosearch?: boolean): {
        selected: KDFilteredInventoryItem;
        tooltipitem: KDFilteredInventoryItem;
    };
    function KDDrawInventoryFilters(xOffset: any, yOffset?: number, filters?: any[], addFilters?: any[], spacing?: number): void;
    function KinkyDungeonDrawInventory(): void;
    function KinkyDungeonSendInventoryEvent(Event: string, data: any): void;
    function KDSendNPCRestraintEvent(Event: string, data: any): void;
    function KinkyDungeonSendInventorySelectedEvent(Event: string, data: any): void;
    function KinkyDungeonSendInventoryIconEvent(Event: string, data: any): void;
    let KinkyDungeonInvDraw: any[];
    function KinkyDungeonQuickGrid(I: number, Width: number, Height: number, Xcount: number): KDPoint;
    let KDScrollOffset: {
        Consumable: number;
        Restraint: number;
        Weapon: number;
    };
    let KDItemsPerScreen: {
        Consumable: number;
        Restraint: number;
        Weapon: number;
    };
    let KDNumOfQuickLoadouts: number;
    let KDQuickLoadoutSave: boolean;
    let KDScrollAmount: number;
    let KDInventoryStatus: {
        HideQuickInv: boolean;
        DropQuickInv: boolean;
        SortQuickInv: boolean;
        FilterQuickInv: boolean;
    };
    function KinkyDungeonDrawQuickInv(): void;
    function KinkyDungeonhandleQuickInv(NoUse?: boolean): boolean;
    function KDDropItemInv(name: string, player?: entity, playerDropped?: boolean): void;
    function KDSortInventory(_player: entity): void;
    function KDLoadQuickLoadout(num: number, clearFirst: boolean): void;
    function KDSaveQuickLoadout(num: number): void;
    function KDRemoveInventoryVariant(Name: string, _Prefix?: string): void;
    function KDRemoveWeaponVariant(Name: string, _Prefix?: string): void;
    function KDRemoveConsumableVariant(Name: string, _Prefix?: string): void;
    function KDPruneInventoryVariants(worn?: boolean, loose?: boolean, lost?: boolean, ground?: boolean, hotbar?: boolean, entities?: boolean, npcrestraints?: boolean, containers?: boolean): void;
    function KDMorphToInventoryVariant(item: item, variant: KDRestraintVariant, prefix?: string, curse?: string, forceMorph?: boolean): void;
    function KDGiveWeaponVariant(variant: KDWeaponVariant, prefix?: string, forceName?: string, suffix?: string, container?: KDContainer): void;
    function KDGiveConsumableVariant(variant: KDConsumableVariant, prefix?: string, forceName?: string, suffix?: string, Quantity?: number, container?: KDContainer): void;
    function KDReturnInventoryVariant(variant: KDRestraintVariant, prefix?: string, curse?: string, ID?: string, forceName?: string, suffix?: string, faction?: string, powerBonus?: number, quantity?: number): item;
    function KDGiveInventoryVariant(variant: KDRestraintVariant, prefix?: string, curse?: string, ID?: string, forceName?: string, suffix?: string, faction?: string, powerBonus?: number, quantity?: number, container?: KDContainer): void;
    function KDGetInventoryVariant(variant: KDRestraintVariant, prefix?: string, curse?: string, ID?: string, forceName?: string, suffix?: string, faction?: string, powerBonus?: number, quantity?: number): item;
    function KDEquipInventoryVariant(variant: KDRestraintVariant, prefix?: string, Tightness?: number, Bypass?: boolean, Lock?: string, Keep?: boolean, Trapped?: boolean, faction?: string, Deep?: boolean, curse?: string, securityEnemy?: entity, useAugmentedPower?: boolean, _inventoryAs?: string, ID?: string, suffix?: string, powerBonus?: number, NoActionPrune?: boolean): number;
    function KDItem(item: Named): weapon | restraint | outfit | consumable;
    function KDItemNoRestraint(item: Named): weapon | outfit | consumable;
    function KDGiveItem(name: string, quantity?: number): boolean;
    function KDDrawHotbarBottom(selected: KDFilteredInventoryItem, spells: boolean, selectSpell: spell, xshift?: number, allowOverflow?: boolean): void;
    function KinkyDungeonAttemptQuickRestraint(Name: string): boolean;
    function KDIsUnidentified(item: item): boolean;
    function KDAlternateInventoryRender(): boolean;
    function KDResetAlternateInventoryRender(): void;
    function KDIsGeneric(item: item): boolean;
    let KDLore: Record<string, Record<string, Lore>>;
    let KinkyDungeonCurrentLore: string;
    let KDLoreImg: Record<string, string>;
    let KDLoreEnemy: Record<string, string>;
    let KinkyDungeonCurrentLoreTab: string;
    let KinkyDungeonCurrentLoreTabs: string[];
    let KinkyDungeonCurrentLoreItems: string[];
    let KinkyDungeonCurrentLoreItemOffset: number;
    let KinkyDungeonCurrentLoreTabOffset: number;
    let KinkyDungeonLoreScale: number;
    let KinkyDungeonRepeatLoreChance: number;
    let KinkyDungeonGenericLoreChance: number;
    let KinkyDungeonNewLoreList: string[];
    function KinkyDungeonNewLore(): boolean;
    function KinkyDungeonUpdateTabs(exploredLore: Record<string, number>): void;
    function KinkyDungeonDrawLore(): void;
    function KDDrawLoreRepTabs(xOffset?: number): void;
    let KDInvBG: string;
    function KDDrawInventoryTabs(xOffset: number, drawBG?: boolean): void;
    let KDProgressEnabled: boolean;
    function KinkyDungeonUpdateLore(exploredLore: Record<string, number>): void;
    function KinkyDungeonHandleLore(): boolean;
    function KDNewLore(tabs: string | string[], id: string, label: string, title: string, text: string, condition?: () => boolean, image?: string, noShow?: string[], enemy?: string): void;
    const KDANGER = -19;
    const KDRAGE = -31;
    const KDPLEASED = 15;
    const KDFRIENDLY = 35;
    let KDStatRep: string[];
    let KDRepColor: {
        Passion: string;
        Frustration: string;
    };
    let KDRepNameColor: {
        Leather: string;
        Latex: string;
        Rope: string;
        Metal: string;
        Will: string;
        Elements: string;
        Conjure: string;
        Illusion: string;
    };
    let KDFactionGoddess: {
        Metal: {
            Angel: number;
            Demon: number;
            Nevermere: number;
            AncientRobot: number;
            Elemental: number;
        };
        Rope: {
            Angel: number;
            Demon: number;
            KinkyConstruct: number;
            Dressmaker: number;
            Bountyhunter: number;
            Bast: number;
            AncientRobot: number;
        };
        Elements: {
            Angel: number;
            Demon: number;
            Witch: number;
            Apprentice: number;
            Elemental: number;
            AncientRobot: number;
        };
        Leather: {
            Angel: number;
            Demon: number;
            Elf: number;
            Dragon: number;
            Bandit: number;
            Elemental: number;
            AncientRobot: number;
        };
        Latex: {
            Angel: number;
            Demon: number;
            Maidforce: number;
            Alchemist: number;
            Nevermere: number;
            AncientRobot: number;
        };
        Will: {
            Angel: number;
            Demon: number;
            Elf: number;
            Bast: number;
            Apprentice: number;
            AncientRobot: number;
        };
        Conjure: {
            Angel: number;
            Demon: number;
            Alchemist: number;
            Witch: number;
            Apprentice: number;
            Dressmaker: number;
            AncientRobot: number;
        };
        Illusion: {
            Angel: number;
            Demon: number;
            Witch: number;
            Apprentice: number;
            Maidforce: number;
            Bountyhunter: number;
            AncientRobot: number;
        };
    };
    let KinkyDungeonGoddessRep: Record<string, number>;
    let KinkyDungeonRescued: Record<string, boolean>;
    let KinkyDungeonAid: Record<string, boolean>;
    let KDRepSelectionMode: string;
    let KDBlessedRewards: Record<string, string[]>;
    function KDPearlRequirement(): boolean;
    function KDGetBlessings(): string[];
    function KinkyDungeonInitReputation(): void;
    function KinkyDungeonRepName(Amount: number): string;
    function KDBarColor(value: number): string;
    let KDREPALLIED: number;
    let KDREPFRIENDLY: number;
    let KDREPFAVORABLE: number;
    let KDREPANNOYED: number;
    let KDREPHOSTILE: number;
    let KDREPWANTED: number;
    function KinkyDungeonRepNameFaction(Amount: number): string;
    function KDRepBarColor(value: number): string;
    function KinkyDungeonChangeFactionRep(Rep: string, Amount: number): boolean;
    function KinkyDungeonChangeRep(Rep: string, Amount: number): boolean;
    function KinkyDungeonHandleReputation(): boolean;
    function KinkyDungeonDrawReputation(): void;
    let KDFactionRepIndex: number;
    let KDMaxFactionsPerBar: number;
    function KinkyDungeonDrawFactionRep(): string;
    let KinkyDungeonPenanceCosts: Record<string, number>;
    let KinkyDungeonPenanceRepBonus: number;
    let KinkyDungeonPenanceRepBonusFail: number;
    let KinkyDungeonPenanceCostGrowth: number;
    let KinkyDungeonPenanceCostDefault: number;
    function KinkyDungeonPenanceCost(rep: string): number;
    function KinkyDungeonCanPenance(_rep: string, value: number): boolean;
    function KinkyDungeonAidManaCost(_rep: string, value: number): number;
    function KinkyDungeonAidManaAmount(_rep: string, _value: number): number;
    function KinkyDungeonCanAidMana(_rep: string, value: number): boolean;
    function KinkyDungeonRescueTiles(): {
        x: number;
        y: number;
    }[];
    function KinkyDungeonCanRescue(rep: string, value: number): boolean;
    function KinkyDungeonUpdateAngel(_delta: number): void;
    let KDTrapTypes: Record<string, KDTrapType>;
    let KDTrapTypesStepOff: {
        DoorLock: (tile: any, entity: entity, x: number, y: number) => {
            msg: string;
            triggered: boolean;
        };
    };
    let KinkyDungeonTrapMoved: boolean;
    function KinkyDungeonHandleStepOffTraps(entity: entity, x: number, y: number, moveX: number, moveY: number): void;
    function KinkyDungeonHandleTraps(entity: entity, x: number, y: number, Moved: boolean): void;
    function KDTrigPanic(chest?: boolean): void;
    type TrapTypeGoddess = {
        Name: string;
        Enemy?: string;
        Spell?: string;
        Level: number;
        Power: number;
        Weight: number;
        strict?: true;
        teleportTime?: number;
    };
    function KinkyDungeonGetGoddessTrapTypes(): TrapTypeGoddess[];
    function KinkyDungeonGetTrap(trapTypes: any[], Level: number, tags: string[]): {
        StepOffTrap: any;
        Name: any;
        Restraint: any;
        Enemy: any;
        FilterTag: any;
        FilterBackup: any;
        Spell: any;
        Power: any;
        extraTag: any;
        Hostile: any;
        Faction: any;
    };
    function KDSmokePuff(x: number, y: number, radius: number, density: number, nomsg?: boolean): void;
    function KDSteamPuff(x: number, y: number, radius: number, density: number, nomsg?: boolean): void;
    let KDCancelEvents: {
        JourneyChoice: (_x: any, _y: any, _tile: any, data: any) => string;
    };
    let KDCancelFilters: {
        JourneyChoice: (_x: any, _y: any, _tile: any, data: any) => "" | "JourneyChoice";
        ProtectOldSaves: (_x: any, _y: any, _tile: any, data: any) => "" | "NoJourneyTarget";
    };
    function KDWettable(entity: entity): boolean;
    function KDConducting(entity: entity): boolean;
    function KinkyDungeonHandleTilesEnemy(enemy: entity, _delta: number): void;
    function KDPeripheralTileEffects(_delta: number): void;
    function KinkyDungeonUpdateTileEffects(delta: number): void;
    let KinkyDungeonChestConfirm: boolean;
    function KinkyDungeonHandleMoveToTile(toTile: string): void;
    function KDCanEscape(method: string): boolean;
    function KDGetEscapeMinimapText(method: string): string;
    function KDGetEscapeDoorText(method: string): string;
    function KDGetEscapeMethod(_level: number): string;
    function KDGetRandomEscapeMethod(RoomType: string, MapMod: string, Level: number, Faction: string): string;
    function KDEffectTileTags(x: number, y: number, mapData?: KDMapDataType): Record<string, boolean>;
    function KDEffectTileTagsLoc(loc: string, mapData?: KDMapDataType): Record<string, boolean>;
    function KinkyDungeonHandleStairs(toTile: string, suppressCheckPoint?: boolean): void;
    function KDGoThruTile(x: number, y: number, suppressCheckPoint: boolean, force: boolean, willing: boolean): void;
    let KinkyDungeonConfirmStairs: boolean;
    function KinkyDungeonHandleMoveObject(moveX: number, moveY: number, moveObject: string): boolean;
    function KDHasEffectTile(x: number, y: number): boolean;
    function KDGetEffectTiles(x: number, y: number, mapData?: KDMapDataType): Record<string, effectTile>;
    function KDGetEffectTilesLoc(str: string, mapData?: KDMapDataType): Record<string, effectTile>;
    function KDGetSpecificEffectTile(x: number, y: number, tile?: string): effectTile;
    function KDCreateEffectTile(x: number, y: number, tile: effectTileRef, durationMod: number): effectTile;
    function KDInteractNewTile(newTile: effectTile): void;
    function KDCreateAoEEffectTiles(x: number, y: number, tile: effectTileRef, durationMod?: number, rad?: number, avoidPoint?: {
        x: number;
        y: number;
    }, density?: number, mod?: string): void;
    function KDRemoveAoEEffectTiles(x: number, y: number, tagsToRemove: string[], rad: number, avoidPoint?: {
        x: number;
        y: number;
    }, density?: number, mod?: string): void;
    function KDApplyAlpha(id: string, alpha: number, fade: string, delta: number): number;
    let KDTileModes: Record<string, boolean>;
    function KDEasePosition(x: number, y: number, tx: number, ty: number, speed: number, delta: number, ease: string): KDPoint;
    let KDLastEffTileUpdate: number;
    function KDDrawEffectTiles(_canvasOffsetX: number, _canvasOffsetY: number, CamX: number, CamY: number): void;
    let TileYFade: Record<string, number>;
    function KDCanSeeEffectTile(tile: effectTile): boolean;
    function KDUpdateEffectTiles(delta: number): void;
    function KinkyDungeonUpdateSingleEffectTile(delta: number, entity: entity, tile: effectTile): void;
    function KinkyDungeonUpdateSingleEffectTileStandalone(delta: number, tile: effectTile): void;
    function KinkyDungeonBulletInteractionSingleEffectTile(b: any, tile: effectTile, d: number): void;
    function KDEffectTileInteractions(x: number, y: number, b: any, d: number): void;
    function KDMoveEntity(enemy: entity, x: number, y: number, willing: boolean, dash?: boolean, forceHitBullets?: boolean, ignoreBlocked?: boolean, noEvent?: boolean, mapData?: KDMapDataType): boolean;
    function KDStaggerEnemy(enemy: entity): void;
    function KDMovePlayer(moveX: number, moveY: number, willing: boolean, sprint?: boolean, forceHitBullets?: boolean, suppressNoise?: boolean, noEvent?: boolean): boolean;
    function KDSlip(dir: {
        x: number;
        y: number;
    }): boolean;
    function KDInferno(existingTile: effectTile, newTile: effectTile, duration: number): boolean;
    function KDGrow(tile: effectTile, type: string, duration?: number, chance?: number, refreshDuration?: number): boolean;
    function KDIgnition(b: any, tile: effectTile, _d: any): void;
    function KDConveyor(_delta: number, X: number, Y: number, unwilling?: boolean): void;
    function KDTickSpecialStats(): void;
    function KDAdvanceLevel(data: any, closeConnections?: boolean, query?: boolean): {
        x: number;
        y: number;
    };
    interface KDAdvanceEventData {
        toTile: string;
        altRoom: AltType;
        altRoomNext: AltType;
        AdvanceAmount: number;
        dataOverride: object;
    }
    let KDAdvanceAmount: Record<string, (altRoom: AltType, altRoomNext: AltType, tile: any) => {
        AdvanceAmount: number;
        dataOverride: object;
    }>;
    type KDTileType = any;
    function KDShouldLock(x: number, y: number, tile: KDTileType): boolean;
    function KDShouldUnLock(x: number, y: number, tile: KDTileType): boolean;
    let KDDangerousTiles: string;
    function KDIsTileDangerous(entity: entity, x: number, y: number, mapData: KDMapDataType): boolean;
    let KDPotentialDangers: Record<string, (entity: entity, x: number, y: number, mapData: KDMapDataType, tags: Record<string, boolean>) => boolean>;
    function KDAdvanceOneFloor(): void;
    function KDRoomUnwanderable(altType: string): boolean;
    let KDHandsfreeChestTypes: string[];
    let KDCornerTiles: {
        A: boolean;
        a: boolean;
        c: boolean;
        o: boolean;
        O: boolean;
        '-': boolean;
        '=': boolean;
        '+': boolean;
        B: boolean;
        M: boolean;
        m: boolean;
        F: boolean;
    };
    let KDTileUpdateFunctionsLocal: Record<string, (delta: number, X?: number, Y?: number) => void>;
    let KDBondageMachineFunctions: Record<string, KDBondageMachineFunc>;
    function KDBasicRestraintsMachine_Player(tags: string[], count: number, msg: string): number;
    let KDTileUpdateFunctions: Record<string, (delta: number) => boolean>;
    let KDMoveObjectFunctions: Record<string, (moveX: number, moveY: number) => boolean>;
    let KDEffectTileFunctionsStandalone: Record<string, (delta: any, tile: effectTile) => boolean>;
    function KDSlimeImmuneEntity(entity: entity): boolean;
    function KDSoapImmuneEntity(entity: entity): boolean;
    function KDSlimeWalker(entity: entity): boolean;
    function KDSoapWalker(entity: entity): boolean;
    function KDSlimeImmune(enemy: entity): boolean;
    function KDSoapImmune(enemy: entity): boolean;
    let KDEffectTileFunctions: Record<string, (delta: number, entity: entity, tile: effectTile) => boolean>;
    let KDEffectTileCreateFunctionsCreator: Record<string, (newTile: effectTile, existingTile: effectTile) => boolean>;
    let KDActivateMapTile: Record<string, (tile: any, x: number, y: number) => boolean>;
    let KDEffectTileCreateFunctionsExisting: Record<string, (newTile: effectTile, existingTile: effectTile) => boolean>;
    let KDEffectTileMoveOnFunctions: Record<string, (entity: entity, tile: effectTile, willing: boolean, dir: {
        x: number;
        y: number;
    }, sprint: boolean) => {
        cancelmove: boolean;
        returnvalue: boolean;
    }>;
    let KDEffectTileBulletFunctions: Record<string, (b: any, tile: effectTile, d: any) => boolean>;
    let KDStairsAltAction: {
        RandomTeleport: (_toTile: any, _suppressCheckPoint: any) => void;
        Null: (_toTile: any, _suppressCheckPoint: any) => void;
    };
    function KDAttemptDoor(moveX: number, moveY: number): void;
    interface KDPointCostSource extends KDPoint {
        g: number;
        f: number;
        s: string;
    }
    let KDPathCache: Map<string, KDPoint[]>;
    let KDPathCacheIgnoreLocks: Map<string, KDPoint[]>;
    let KDSmartMovable: Map<any, any>;
    let KDMovable: Map<any, any>;
    function KDUpdateDoorNavMap(): void;
    function KDIsMovable(x: number, y: number): boolean;
    function KDIsSmartMovable(x: number, y: number): boolean;
    let KDPathfindingCacheHits: number;
    let KDPathfindingCacheFails: number;
    let KDPFTrim: number;
    function KinkyDungeonFindPath(startx: number, starty: number, endx: number, endy: number, blockEnemy: boolean, blockPlayer: boolean, ignoreLocks: boolean, Tiles: string, RequireLight?: boolean, noDoors?: boolean, needDoorMemory?: boolean, Enemy?: entity, trimLongDistance?: boolean, heuristicOverride?: (x: number, y: number, xx: number, yy: number) => number, taxicab?: boolean, ignoreTrafficLaws?: boolean, allowPassable?: boolean, ignoreAllWeighting?: boolean): KDPoint[];
    function KinkyDungeonGetPath(closed: Map<string, KDPointCostSource>, xx: number, yy: number, endx?: number, endy?: number): KDPoint[];
    function KDSetPathfindCache(PathMap: Map<string, KDPoint[]>, newPath: KDPoint[], endx: number, endy: number, Tiles: string, Finalindex: string): void;
    function KDUpdateBuffsOnLoad(): void;
    function KinkyDungeonSendBuffEvent(event: string, data: any): void;
    function KinkyDungeonTickBuffs(entity: entity, delta: number, endFloor: boolean): void;
    function KinkyDungeonTickBuffTag(entity: entity, tag: string, amout?: number): void;
    function KDEntityHasBuffTags(entity: entity, tag: string): boolean;
    function KDGetBuffsWithTag(entity: entity, tag: string): Record<string, KDBuff>;
    function KinkyDungeonRemoveBuffsWithTag(entity: entity, tags: string[]): void;
    function KinkyDungeonUpdateBuffs(delta: number, endFloor: boolean): void;
    function KDUpdatePlayerShield(PlayerBuffs?: Record<string, KDBuff>): void;
    function KDDamagePlayerShield(Amount: number, Player: entity): void;
    function KDBuffEnabled(list: Record<string, KDBuff>, buff: KDBuff, onlyPositiveDuration: boolean): boolean;
    let KDBuffedStatTypeMemo: Map<Record<string, KDBuff>, Record<string, KDBuff[]>>;
    let KDBuffedStatTypeMemoUpdate: Map<Record<string, KDBuff>, string[]>;
    function KDUpdateBuffedStatTypeMemo(list: Record<string, KDBuff>): void;
    function KinkyDungeonGetBuffedStat(list: Record<string, KDBuff>, Stat: string, onlyPositiveDuration?: boolean): number;
    function KinkyDungeonGetMaxBuffedStat(list: Record<string, KDBuff>, Stat: string, onlyPositiveDuration: boolean): number;
    function KinkyDungeonExpireBuff(entity: entity, key: string): void;
    function KDUpdateBuffStatMemo(list: Record<string, KDBuff>, stat: string): void;
    function KinkyDungeonApplyBuffToEntity(entity: entity, origbuff: KDBuff, changes?: Record<string, any>): KDBuff;
    function KDApplyBuff(list: Record<string, KDBuff>, origbuff: KDBuff, changes: Record<string, any>, entity: entity): KDBuff;
    function KinkyDungeonGetbuff(list: Record<string, KDBuff>, buffId: string): KDBuff;
    function KinkyDungeonHasBuff(list: Record<string, KDBuff>, buffId: string, excludeNoDuration?: boolean): boolean;
    function KDEntityHasBuff(entity: entity, buffId: string, excludeNoDuration?: boolean): boolean;
    function KDEntityBuffedStat(entity: entity, stat: string, onlyPositiveDuration?: boolean): number;
    function KDEntityMaxBuffedStat(entity: entity, stat: string, onlyPositiveDuration?: boolean): number;
    function KDEntityGetBuff(entity: entity, buffId: string): KDBuff;
    let KinkyDungeonAttackTwiceFlag: boolean;
    let KinkyDungeonSlimeParts: ({
        group: string;
        restraint: string;
        noUnmasked: boolean;
    } | {
        group: string;
        restraint: string;
        noUnmasked?: undefined;
    })[];
    let KDAlertCD: number;
    let KDHeelPowerGrowthExponent: number;
    let KDEventDataReset: {};
    let KDSoundDescBase: SoundDescData[];
    let KDShockwaveDataBase: ShockwaveData[];
    let KDEventDataBase: {
        SlimeLevel: number;
        SlimeLevelStart: number;
        CurseHintTick: boolean;
        ActivationsThisTurn: number;
        sounddesc: SoundDescData[];
        shockwaves: ShockwaveData[];
    };
    interface SoundDescData {
        x: number;
        y: number;
        desc: string;
        shockwave: ShockwaveData;
        lastShockwave: number;
        shockwavePeriod: number;
    }
    interface ShockwaveData {
        x: number;
        y: number;
        radius: number;
        sprite: string;
    }
    let KDEventData: {
        SlimeLevel: number;
        SlimeLevelStart: number;
        CurseHintTick: boolean;
        ActivationsThisTurn: number;
        sounddesc: SoundDescData[];
        shockwaves: ShockwaveData[];
    };
    function KDMapHasEvent(map: Record<string, any>, event: string): boolean;
    function KinkyDungeonSendEvent(Event: string, data: any, forceSpell?: spell, forceWeapon?: item, mapData?: KDMapDataType): void;
    function KinkyDungeonResetEventVariables(): void;
    function KinkyDungeonResetEventVariablesTick(delta: number): void;
    let KDEventMapInventoryIcon: Record<string, Record<string, (e: KinkyDungeonEvent, item: item, data: any) => void>>;
    function KinkyDungeonHandleInventoryIconEvent(Event: string, e: KinkyDungeonEvent, item: item, data: any): void;
    let KDEventMapInventorySelected: Record<string, Record<string, (e: KinkyDungeonEvent, item: item, data: any) => void>>;
    function KinkyDungeonHandleInventorySelectedEvent(Event: string, kinkyDungeonEvent: KinkyDungeonEvent, item: item, data: any): void;
    let KDEventMapInventory: Record<string, Record<string, (e: KinkyDungeonEvent, item: item, data: any) => void>>;
    function KinkyDungeonHandleInventoryEvent(Event: string, e: KinkyDungeonEvent, item: item, data: any): void;
    const KDEventMapBuff: Record<string, Record<string, (e: KinkyDungeonEvent, buff: KDBuff, item: entity, data: any) => void>>;
    function KinkyDungeonHandleBuffEvent(event: string, e: KinkyDungeonEvent, buff: KDBuff, entity: entity, data: any): void;
    let KDEventMapOutfit: Record<string, Record<string, (e: KinkyDungeonEvent, outfit: outfit, data: any) => void>>;
    function KinkyDungeonHandleOutfitEvent(Event: string, e: KinkyDungeonEvent, outfit: outfit, data: any): void;
    let KDEventMapSpell: Record<string, Record<string, (e: KinkyDungeonEvent, spell: spell, data: any) => void>>;
    function KinkyDungeonHandleMagicEvent(Event: string, e: KinkyDungeonEvent, spell: spell, data: any): void;
    let KDEventMapWeapon: Record<string, Record<string, (e: KinkyDungeonEvent, weapon: weapon, data: any) => void>>;
    function KinkyDungeonHandleWeaponEvent(Event: string, e: KinkyDungeonEvent, weapon: weapon, data: any): void;
    let KDEventMapBullet: Record<string, Record<string, (e: KinkyDungeonEvent, b: KDBullet, data: any) => void>>;
    function KinkyDungeonHandleBulletEvent(Event: string, e: KinkyDungeonEvent, b: any, data: any): void;
    let KDEventMapEnemy: Record<string, Record<string, (e: KinkyDungeonEvent, enemy: entity, data: any) => void>>;
    function KinkyDungeonHandleEnemyEvent(Event: string, e: KinkyDungeonEvent, enemy: entity, data: any): void;
    let KDEventMapGeneric: Record<string, Record<string, (e: string, data: any) => void>>;
    function KinkyDungeonHandleGenericEvent(Event: string, data: any): void;
    function KDEventPrereq(_e: string, item?: item, tags?: any): string | true;
    function KDIsHumanoid(enemy: entity): boolean;
    function KDTriggerSpell(spell: spell, data: any, Passive: boolean, Toggle: boolean): void;
    function KDAddTraineeWP(player: entity, powerAdded: number): void;
    function KDAddArcaneEnergy(player: entity, powerAdded: number): void;
    let KDHardModeReplace: {
        WitchShock: string;
        WitchChain: string;
        Drone: string;
        CaptureBot: string;
        EnforcerBot: string;
        Alchemist: string;
        WolfgirlPet: string;
        WolfApprentice: string;
        WolfTapeDrones: string;
        Bandit: string;
        BanditHunter: string;
        BanditGrappler: string;
        SmallSlime: string;
        FastSlime: string;
        LatexCubeSmall: string;
        LatexCube: string;
        Dragon: string;
        DragonShield: string;
        ElementalFire: string;
        Pixie: string;
        Statue: string;
        SoulCrystal: string;
        ShadowHand: string;
        ShadowGhast: string;
        Gag: string;
        Scarves: string;
        RopeSnake: string;
        LearnedRope: string;
        Apprentice: string;
        Apprentice2: string;
        HighWizard: string;
        Dressmaker: string;
        Mummy: string;
        Cleric: string;
        BlindZombie: string;
        FastZombie: string;
        Ninja: string;
        Maidforce: string;
        MaidforcePara: string;
        LesserSkeleton: string;
        Skeleton: string;
        OldDrone: string;
    };
    function KinkyDungeonSendAltEvent(Event: string, data: any): void;
    function KinkyDungeonHandleAltEvent(Event: string, e: KinkyDungeonEvent, alt: any, data: any): void;
    let KDEventMapAlt: Record<string, Record<string, (e: KinkyDungeonEvent, alt: any, data: any) => void>>;
    function KinkyDungeonSendFacilityEvent(Event: string, data: any): void;
    function KinkyDungeonHandleFacilityEvent(Event: string, e: KinkyDungeonEvent, fac: string, data: any): void;
    let KDEventMapFacility: Record<string, Record<string, (e: KinkyDungeonEvent, fac: string, data: any) => void>>;
    function KDStunResist(data: any): void;
    function KDAddEvent(map: any, trigger: any, type: any, code: any): void;
    function KDTargetEnemy(en: entity, onlyHostileAggro?: boolean): boolean;
    function KinkyDungeonAddTags(tags: string[], Floor: number): void;
    let KDPerkToggleTags: string[];
    function KinkyDungeonGetEnemy(enemytags: string[], Level: number, Index: string, Tile: string, requireTags?: string[], alliances?: {
        requireHostile?: string;
        requireAllied?: string;
        requireNonHostile?: string;
    }, bonusTags?: Record<string, {
        bonus: number;
        mult: number;
    }>, filterTags?: string[], requireSingleTag?: string[], minWeight?: number, minWeightFallback?: boolean, noOverrideFloor?: boolean): enemy;
    function KDEntityCanBeGuard(en: entity, faction: string, requireTags: string[]): boolean;
    function KinkyDungeonCallGuard(x: number, y: number, _noTransgress: boolean, normalDrops: boolean, requireTags?: string[]): entity;
    let KinkyDungeonTotalSleepTurns: number;
    let KinkyDungeonSearchTimer: number;
    let KinkyDungeonSearchTimerMin: number;
    let KinkyDungeonFirstSpawn: boolean;
    let KinkyDungeonSearchStartAmount: number;
    let KinkyDungeonSearchHuntersAmount: number;
    let KinkyDungeonSearchEntranceAdjustAmount: number;
    let KinkyDungeonSearchEntranceChaseAmount: number;
    function KinkyDungeonHandleWanderingSpawns(delta: number): void;
    let HunterPulse: number;
    let HunterSpawnTimer: number;
    let KDMainFactionSecurityMod: number;
    let KDMaxCageTime: number;
    let KDMaxKeys: number;
    let KDJailFilters: string[];
    function KDAssignGuardAction(guard: entity, xx: number, yy: number): void;
    function KDGetJailEvent(guard: entity, xx: number, yy: number): (g: entity, x: number, y: number) => void;
    function KinkyDungeonLoseJailKeys(Taken?: boolean, boss?: boolean, enemy?: entity): void;
    function KinkyDungeonUpdateJailKeys(): void;
    function KinkyDungeonAggroFaction(faction: string, noAllyRepPenalty?: boolean, securityPenalty?: number): boolean;
    function KinkyDungeonPlayerIsVisibleToJailers(): any;
    function KDCalcPlayChance(playChance: number, enemy: entity): number;
    function KinkyDungeonCanPlay(enemy: entity): boolean;
    function KinkyDungeonCheckRelease(): number;
    let KDMaxAlertTimer: number;
    let KDMaxAlertTimerAggro: number;
    function KinkyDungeonAggroAction(action: string, data: {
        enemy?: entity;
        x?: number;
        y?: number;
        faction?: string;
        force?: boolean;
    }): void;
    let KDLocalChaseTypes: string[];
    let KDSevereTypes: string[];
    let KDMaxGuiltPerAggro: number;
    let KDGuiltMult: number;
    function KinkyDungeonStartChase(enemy: entity, Type: string, faction?: string, force?: boolean): void;
    function KinkyDungeonPlayExcuse(enemy: entity, Type: string): void;
    function KDSetPlayCD(enemy: entity, mult: number, base?: number): void;
    function KinkyDungeonGetJailRestraintForGroup(Group: string, jailRestraintList?: KDJailRestraint[], lock?: string): {
        restraint: restraint;
        variant: string;
    };
    function KinkyDungeonGetJailRestraintsForGroup(Group: string, jailRestraintList?: KDJailRestraint[], agnostic?: boolean, lock?: string, ignoreLevel?: boolean, _ignoreWorn?: boolean): {
        restraint: restraint;
        variant: string;
        def: KDJailRestraint;
    }[];
    function KDJailCondition(r: KDJailRestraint): boolean;
    function KDPriorityCondition(r: KDJailRestraint): boolean;
    function KinkyDungeonGetJailRestraintLevelFor(Name: string): number;
    function KinkyDungeonInJail(filter: string[]): boolean;
    function KinkyDungeonPlaceJailKeys(): void;
    function KinkyDungeonHandleJailSpawns(delta: number, useExistingGuard?: boolean): void;
    function KinkyDungeonLockableItems(): any[];
    function KinkyDungeonMissingJailUniform(): any[];
    function KinkyDungeonTooMuchRestraint(): any[];
    function KDPutInJail(player: entity, enemy: entity, point: {
        x: number;
        y: number;
    }): boolean;
    function KinkyDungeonHandleLeashTour(xx: number, yy: number, type: string): void;
    function KDGetEffSecurityLevel(faction?: string, Cap?: boolean): number;
    function KinkyDungeonJailGuardGetLeashWaypoint(xx: number, yy: number, type: string): void;
    function KinkyDungeonJailGetLeashPoint(xx: number, yy: number, enemy: entity): {
        x: number;
        y: number;
    };
    function KinkyDungeonPlayerInCell(any?: boolean, qualified?: boolean, filter?: string[]): boolean;
    function KinkyDungeonPointInCell(x: number, y: number, radius?: number): boolean;
    function KinkyDungeonPassOut(noteleport?: boolean): void;
    function KDGetJailDoor(x: number, y: number): {
        tile: any;
        x: number;
        y: number;
    };
    function KDGetSawFlag(flag: string, faction: string): number;
    function KDDefeatedPlayerTick(nodefeat?: boolean): void;
    function KDEnterDemonTransition(): void;
    function KDCreateDragonLair(dragon: entity, lairType: string, slot: KDWorldSlot): string;
    function KDAddDefeatRestraints(enemy: entity, allowFurniture: boolean): void;
    function KDEnterDragonLair(dragon: entity, lairType?: string): void;
    function KDEnterDollTerminal(willing: boolean, cancelDialogue?: boolean, forceOutfit?: boolean): void;
    function KDApplyLivingCollars(): void;
    function KDRemovePrisonRestraints(): void;
    function KDResetDialogue(): void;
    function KinkyDungeonDefeat(PutInJail?: boolean, leashEnemy?: entity): void;
    function KDRepairRubble(JailBorderOnly: boolean): void;
    function KDEnemyIsTemporary(enemy: entity): boolean;
    function KDKickEnemies(nearestJail: any, ignoreAware: boolean, Level: number, noCull?: boolean, ignoreEntities?: entity[]): boolean;
    function KDResetAllIntents(nonHostileOnly?: boolean, endPlay?: number, _player?: void): void;
    function KDResetAllAggro(_player?: void): void;
    function KDForceWanderFar(player: any, radius?: number): void;
    function KDWanderEnemy(en: entity): void;
    function KDKickEnemy(e: entity, minDist?: number, force?: boolean): void;
    function KDKickEnemyLocal(e: entity): void;
    function KinkyDungeonStripInventory(KeepPicks?: boolean, KeepOutfit?: boolean): void;
    function KinkyDungeonStripOutfits(KeepOutfit?: boolean): void;
    function KDExpireFlags(enemy: entity): void;
    function KDGetJailRestraints(overrideTags?: string[], requireJail?: boolean, requireParole?: boolean): KDJailRestraint[];
    function KDSetWorldSlot(x: number, y: number, jx?: number, jy?: number): void;
    let KDCustomDefeats: Record<string, (enemy: entity) => void>;
    let KDCustomDefeatUniforms: {
        WolfgirlHunters: () => void;
        MaidSweeper: () => void;
        DollShoppe: () => void;
        CyberDoll: () => void;
        RopeDojo: () => void;
        Adventurer: () => void;
        ElementalSlave: () => void;
    };
    function KDFixPlayerClothes(faction: string): void;
    function KDResetGuardSpawnTimer(): void;
    let KDChestRank: {
        gold: number;
        lessergold: number;
        silver: number;
        storage: number;
    };
    let KDChestPenalty: {
        gold: number;
        lessergold: number;
        silver: number;
        storage: number;
    };
    function KDChestSecurity(data: {
        enemy?: entity;
        x?: number;
        y?: number;
        faction?: string;
    }): number;
    function KDGetHiSecDialogue(enemy: entity): string;
    function KDGetLeashFaction(leashEnemy: entity): string;
    function KDGetLeashJailRoom(leashEnemy: entity): string;
    function KDHasEntranceToJailRoom(jailRoom: string, map: WorldCoord, allowMainInstead: boolean): boolean;
    function KDGetEntranceToJailRoom(jailRoom: string, map: WorldCoord): KDPoint;
    function KDApplyJailOutfit(): void;
    function KDGetNearestFactionGuard(x: number, y: number): entity;
    function KDPrisonCommonGuard(player: entity, _call?: boolean, suppressCall?: boolean): entity;
    function KDPrisonGetGroups(_player: entity, jailLists: string[], lock: string, maxPower: number): KDJailGetGroupsReturn;
    function KDPrisonTick(_player: entity): boolean;
    function KDPrisonIsInFurniture(player: entity): boolean;
    function KDGoToSubState(_player: entity, state: string): string;
    function KDPopSubstate(_player: entity): string;
    function KDSetPrisonState(_player: entity, state: string): string;
    function KDCurrentPrisonState(_player: entity): string;
    function KDDoUniformRemove(player: entity, guard: entity, jailGroups: string[], lockType: string, power: number): string;
    function KDDoUniformApply(player: entity, guard: entity, jailGroups: string[], lockType: string, power: number): string;
    let KDCYBERPOWER: number;
    let KDJAILPOWER: number;
    let KDPRISONGROUPS: string[][];
    let KDPrisonTypes: Record<string, KDPrisonType>;
    function KDLostJailTrack(player: any): "" | "Furniture" | "InTraining" | "Unaware";
    function KDLostJailTrackCell(player: any): "" | "Furniture" | "InTraining" | "Unaware" | "InCell";
    function KDGetJailEnemy(): enemy;
    let KDJailStripSearchTime: number;
    let KDJailStripSearchTempTime: number;
    function KDShouldStripSearchPlayer(player: entity, allowFlag?: boolean): boolean;
    function KDDoStripSearchRemove(player: entity, guard: entity): string;
    let KDSetpieceAttempts: number;
    let KDSetPieces: ({
        Name: string;
        tags: string[];
        Radius: number;
        xPad?: undefined;
        yPad?: undefined;
        xPadEnd?: undefined;
        yPadEnd?: undefined;
        Max?: undefined;
        Prereqs?: undefined;
        noPOI?: undefined;
    } | {
        Name: string;
        tags: string[];
        Radius: number;
        xPad: number;
        yPad: number;
        xPadEnd: number;
        yPadEnd: number;
        Max?: undefined;
        Prereqs?: undefined;
        noPOI?: undefined;
    } | {
        Name: string;
        tags: string[];
        Radius: number;
        Max: number;
        xPad?: undefined;
        yPad?: undefined;
        xPadEnd?: undefined;
        yPadEnd?: undefined;
        Prereqs?: undefined;
        noPOI?: undefined;
    } | {
        Name: string;
        tags: string[];
        Radius: number;
        Prereqs: string[];
        Max: number;
        xPad: number;
        yPad: number;
        xPadEnd: number;
        yPadEnd: number;
        noPOI?: undefined;
    } | {
        Name: string;
        tags: string[];
        Radius: number;
        Max: number;
        xPad: number;
        yPad?: undefined;
        xPadEnd?: undefined;
        yPadEnd?: undefined;
        Prereqs?: undefined;
        noPOI?: undefined;
    } | {
        Name: string;
        tags: string[];
        noPOI: boolean;
        Radius: number;
        xPad: number;
        yPad: number;
        xPadEnd: number;
        yPadEnd: number;
        Max?: undefined;
        Prereqs?: undefined;
    })[];
    let KDCountSetpiece: Map<any, any>;
    type ChestEntry = {
        x: number;
        y: number;
        priority: boolean;
        Faction: string;
        NoTrap: boolean;
    };
    type ShrineEntry = {
        x: number;
        y: number;
        priority: boolean;
    };
    type SpawnEntry = {
        x: number;
        y: number;
        required: string[];
        AI: string;
        tags?: string[];
        ftags?: string[];
        faction?: string;
        force?: boolean;
        keys?: boolean;
        priority?: boolean;
        noPlay?: boolean;
        levelBoost?: number;
        forceIndex?: string;
    };
    function KinkyDungeonPlaceSetPieces(POI: any, trapLocations: {
        x: number;
        y: number;
    }[], chestlist: ChestEntry[], shrinelist: ShrineEntry[], chargerlist: any[], spawnPoints: SpawnEntry[], InJail: boolean, width: number, height: number): void;
    function KDGetFavoredSetpieces(POI: any, setpieces: any[]): any[];
    function KDGetFavoringSetpieces(Name: string, tags: string[], POI: any, POIBlacklist?: Map<any, boolean>): any;
    function KinkyDungeonGetSetPiece(POI: any, setpieces: any[], pieces: Map<string, any>): any;
    function KinkyDungeonGenerateSetpiece(POI: any, Piece: any, InJail: boolean, trapLocations: {
        x: number;
        y: number;
    }[], chestlist: ChestEntry[], shrinelist: ShrineEntry[], _chargerlist: any[], spawnPoints: SpawnEntry[], forcePOI: boolean, altType: any, MapParams: floorParams): {
        Pass: boolean;
        Traps: {
            x: number;
            y: number;
        }[];
    };
    function KDUnblock(x: number, y: number): boolean;
    interface KDSpawnResult {
        id: number;
        persistent: boolean;
        entity: entity;
        success: boolean;
    }
    function SetpieceSpawnPrisoner(x: number, y: number, persistentOnly?: boolean, lock?: string, faction?: string, sameLocation?: boolean): KDSpawnResult;
    function KDTorch(X: number, Y: number, altType: any, MapParams: any): void;
    function KDTorchUnlit(X: number, Y: number, altType: any, MapParams: any): void;
    function KDChest(X: number, Y: number, loot?: string, faction?: string): void;
    function KDCreateDoors(Left: number, Top: number, Width: number, Height: number, openChance?: number, convertDoodads?: boolean): void;
    function KDPlaceChest(cornerX: number, cornerY: number, _radius: number, chestlist: ChestEntry[], spawnPoints: SpawnEntry[], NoAddToChestList?: boolean): string;
    function KDAddPipes(pipechance: number, pipelatexchance: number, thinlatexchance: number, heavylatexspreadchance: number): void;
    function KDGetNPCRestraintJailDialogueType(restraint: NPCRestraint): "PrisonerLatex" | "PrisonerJail";
    function KDImprisonEnemy(e: entity, noJam: boolean, dialogue?: string, restraint?: NPCRestraint, restraintSet?: Record<string, number>, faction?: string, force?: boolean, LevelBonus?: number): boolean;
    let KDDialogueData: {
        CurrentDialogueIndex: number;
    };
    let KDDialogueDelay: number;
    function KDPersonalitySpread(Min: number, Avg: number, Max: number, Enemy?: entity): number;
    function KinkyDungeonCanPutNewDialogue(): boolean;
    function KDBasicCheck(PositiveReps: string[], NegativeReps: string[], Modifier?: number): number;
    function KDDialogueApplyPersonality(allowed: string[]): void;
    function KDGetDialogue(): KinkyDialogue;
    let KDMaxDialogue: number;
    let KDOptionOffset: number;
    function KDDrawDialogue(delta: number): void;
    function KDIncreaseOfferFatigue(Amount: number): void;
    function KDEnemyHelpfulness(enemy: entity): number;
    function KDGetSpeaker(global?: boolean): entity;
    function KDDialogueEnemy(): entity;
    function KDGetSpeakerFaction(): string;
    function KDPleaseSpeaker(Amount: number): void;
    function KDAddOpinion(enemy: entity, Amount: number): number;
    function KDAddOpinionCollection(enemy: KDCollectionEntry, Amount: number): number;
    function KDAllySpeaker(Turns: number, Follow: boolean): void;
    function KDAggroSpeaker(Turns?: number, NoAlertFlag?: boolean): void;
    function KDBasicDialogueSuccessChance(checkResult: number): number;
    function KDAgilityDialogueSuccessChance(checkResult: number): number;
    function KDOffensiveDialogueSuccessChance(checkResult: number): number;
    let KinkyDungeonDialogueTimer: number;
    function KDStartDialog(Dialogue: string, Speaker?: string, Click?: boolean, Personality?: string, enemy?: entity): void;
    function KDDoDialogue(data: any): void;
    function KDStartDialogInput(Dialogue: string, Speaker?: string, Click?: boolean, Personality?: string, enemy?: entity): void;
    function KDDialogueGagged(): boolean;
    function KDHandleDialogue(): boolean;
    function DialogueCreateEnemy(x: number, y: number, Name: string, persistentid?: number, noLoadout?: boolean): entity;
    function DialogueGetEnemy(Name: string, persistentid?: number): entity;
    function KDRunCreationScript(entity: entity, coord: WorldCoord): void;
    function KDAllyDialogue(name: string, requireTags: string[], requireSingleTag: string[], excludeTags: string[], weight: number): KinkyDialogue;
    let KDPrisonRescues: Record<string, {
        speaker: string;
        faction: string;
    }>;
    function KDPrisonerRescue(name: string, faction: string, enemytypes: string[]): KinkyDialogue;
    function KDRecruitDialogue(name: string, faction: string, outfitName: string, goddess: string, restraints: string[], restraintscount: number, restraintsAngry: string[], restraintscountAngry: number, requireTags: string[], requireSingleTag: string[], excludeTags: string[], chance: number): KinkyDialogue;
    let KDMaxSellItems: number;
    function KDShopDialogue(name: string, items: string[], requireTags: string[], requireSingleTag: string[], chance: number, itemsdrop: string[]): KinkyDialogue;
    function KDShopBuyDialogue(name: string): KinkyDialogue;
    let KDOfferCooldown: number;
    type refuseFunc = (firstRefused: boolean) => boolean;
    function KDYesNoTemplate(setupFunction: refuseFunc, yesFunction: refuseFunc, noFunction: refuseFunc, domFunction: refuseFunc): KinkyDialogue;
    function KDDialogueTriggerOffer(name: string, goddess: string[], restraintTags: string[], allowedPrisonStates: string[], allowedPersonalities: string[], requireTagsSingle: string[], requireTagsSingle2: string[], requireTags: string[], excludeTags: string[], requireFlags: string[], excludeFlags: string[], Lock?: string, WeightMult?: number): KinkyDialogueTrigger;
    function KDYesNoBasic(name: string, goddess: string[], antigoddess: string[], restraint: string[], diffSpread: number[], OffdiffSpread: number[], count?: number, countAngry?: number, Lock?: string, Ally?: boolean, Flags?: {
        name: string;
        duration: number;
        floors?: number;
    }[], CurseList?: string, HexList?: string, EnchantList?: string, hexlevelmin?: number, hexlevelmax?: number, enchantlevelmin?: number, enchantlevelmax?: number): KinkyDialogue;
    function KDSaleShop(name: string, items: string[], requireTags: string[], requireSingleTag: string[], chance: number, markup: number, itemsdrop?: string[], multiplier?: number): KinkyDialogue;
    function DialogueBringNearbyEnemy(x: number, y: number, radius: number, unaware?: boolean): entity;
    function DialogueBringSpecific(x: number, y: number, enemy: entity): entity;
    function KDIsSubmissiveEnough(_enemy?: entity): boolean;
    function KDGetModifiedOpinion(enemy: entity, allowFaction?: boolean, allowSub?: boolean, allowPerk?: boolean, allowOnlyPosNegFaction?: number): number;
    function KDAddOffer(Amount: number): void;
    function KDGetOfferLevelMod(): number;
    function KDRunChefChance(player: entity, force?: boolean): void;
    function KDItemSubThreshold(item: string, nomult?: boolean): number;
    function KDGetShopCost(enemy: entity, sell: boolean): number;
    function KDAggroMapFaction(): void;
    function DialogueAddCursedEnchantedHexed(restraint: restraint, enemy?: entity, Curse?: string, HexList?: string, EnchantList?: string, hexlevelmin?: number, hexlevelmax?: number, enchantlevelmin?: number, enchantlevelmax?: number, returnOnly?: boolean, inventory?: boolean, Lock?: string): item;
    function KDGetPlayerUntieBindAmt(enemy: entity): number;
    function KDUntieEnemy(enemy: entity, amount: number, includeConjured?: boolean, includeUnlocked?: boolean): void;
    function KDAggroViaDialogue(enemy: entity, unaware: boolean, aggroothers: boolean): void;
    let KinkyDungeonMaxDialogueTriggerDist: number;
    let KDDialogueTriggers: Record<string, KinkyDialogueTrigger>;
    function KDDefaultPrereqs(enemy: entity, AIData: any, dist: number, maxdist: number, chance: number, restraintTags: string[], force: boolean, Lock?: string): boolean;
    function KDShopTrigger(name: string): KinkyDialogueTrigger;
    function KDRecruitTrigger(name: string, dialogue: KinkyDialogue): KinkyDialogueTrigger;
    function KDBossTrigger(name: string, enemyName: string[]): KinkyDialogueTrigger;
    function KDBossLose(name: string, enemyName: string[], tags: string[], condition?: () => boolean): KinkyDialogueTrigger;
    function KinkyDungeonGetShopForEnemy(enemy: entity, guaranteed?: boolean): string;
    let KDDialogueParams: {
        ShopkeeperHelpFee: number;
        ShopkeeperHelpFeePerLevel: number;
        ShopkeeperHelpFeePerPower: number;
        ShopkeeperHelpFeeFreebiePower: number;
        ShopkeeperFee: number;
        ShopkeeperFeePerLevel: number;
        ShopkeeperFeePunishThresh: number;
        ChefChance: number;
        KDTableFlipWP: number;
        MasterworkCount: number;
    };
    let KDResertNGTags: string[];
    let KDShopPersonalities: string[];
    let KDShops: Record<string, {
        name: string;
        tags: string[];
        singletag: string[];
        chance: number;
        items?: string[];
        itemsdrop?: string[];
    }>;
    let KDRecruitDialog: Record<string, {
        name: string;
        outfit: string;
        tags: string[];
        singletag: string[];
        excludeTags: string[];
        chance: number;
    }>;
    let KDAllyDialog: Record<string, {
        name: string;
        tags: string[];
        singletag: string[];
        excludeTags: string[];
        weight: number;
    }>;
    let KDSleepBedPercentage: number;
    let KDDialogue: Record<string, KinkyDialogue>;
    enum KDSkillCheckType {
        Fitness = "Fitness",
        Agility = "Agility"
    }
    let KDSkillCheckTypes: Record<KDSkillCheckType, ((en: entity, player: entity, target: entity, diffMod: number) => number)>;
    function KDGetSkillCheck(en: entity, player: entity, target: entity, type: KDSkillCheckType, diffMod?: number): number;
    function KinkyDungeonAggressive(enemy?: entity, player?: entity): boolean;
    function KDAllied(enemy: entity): boolean;
    function KDHostile(enemy: entity, enemy2?: entity): boolean;
    function KDOpinionRepMod(enemy: entity, player: entity): number;
    function KDIsServant(value: KDCollectionEntry): boolean;
    function KDGetFaction(enemy: entity | string): string;
    function KDGetFactionOriginal(enemy: entity): string;
    function KDFactionHostile(a: string, b: string | entity, mod?: number, modfree?: number): boolean;
    function KDFactionAllied(a: string, b: string | entity, threshold?: number, _mod?: number): boolean;
    function KDFactionFavorable(a: string, b: string | entity): boolean;
    function KDGetFactionProps(list: string[], Floor: number, Checkpoint: string, tags: string[], bonustags: Record<string, {
        bonus: number;
        mult: number;
    }>, X?: number, Y?: number): Record<string, number>;
    function KDGetHonor(a: string, b: string): number;
    let KinkyDungeonFactionColors: {
        Jail: string[];
        Slime: string[];
        Latex: string[];
        Dressmaker: string[];
        Alchemist: string[];
        Elf: string[];
        Bountyhunter: string[];
        AncientRobot: string[];
        Dollsmith: string[];
        Mushy: string[];
        Apprentice: string[];
        Witch: string[];
    };
    let KDFactionNoCollection: string[];
    let KinkyDungeonFactionFilters: Record<string, Record<string, LayerFilter>>;
    let KDFactionProperties: Record<string, KDFactionProps>;
    let KDHiddenFactions: string[];
    let KinkyDungeonHiddenFactions: Map<string, boolean>;
    function KinkyDungeonHiddenFactionsPush(str: any): void;
    let KDFactionSecurityMod: {
        Dressmaker: {
            level_magic: number;
            level_key: number;
        };
        Witch: {
            level_magic: number;
            level_key: number;
        };
        Elemental: {
            level_magic: number;
        };
        Mushy: {
            level_magic: number;
            level_tech: number;
        };
        Apprentice: {
            level_magic: number;
            level_key: number;
        };
        Elf: {
            level_magic: number;
            level_key: number;
        };
        Bast: {
            level_magic: number;
        };
        AncientRobot: {
            level_tech: number;
            level_key: number;
        };
        Nevermere: {
            level_tech: number;
            level_key: number;
        };
        Maidforce: {
            level_tech: number;
            level_magic: number;
            level_key: number;
        };
        Alchemist: {
            level_tech: number;
            level_magic: number;
        };
        Bountyhunter: {
            level_tech: number;
            level_key: number;
        };
    };
    let KDBaseSecurity: {
        level_key: number;
    };
    let KDPiousFactions: {
        Angel: number;
    };
    let KinkyDungeonTooltipFactions: string[];
    let KinkyDungeonFactionTag: {
        Bountyhunter: string;
        Bandit: string;
        Alchemist: string;
        Nevermere: string;
        Apprentice: string;
        RopeDojo: string;
        Dressmaker: string;
        DollShoppe: string;
        Witch: string;
        Elemental: string;
        Owners: string;
        Dragon: string;
        Maidforce: string;
        Delinquent: string;
        Bast: string;
        Elf: string;
        AncientRobot: string;
        ShadowClan: string;
        Debate: string;
        Wolfhunter: string;
        Extraplanar: string;
        DubiousWitch: string;
        Virus: string;
        Dollsmith: string;
        Warden: string;
    };
    let KinkyDungeonFactionJailTag: {
        Bountyhunter: string;
        Bandit: string;
        Alchemist: string;
        Nevermere: string;
        Apprentice: string;
        RopeDojo: string;
        Dressmaker: string;
        DollShoppe: string;
        Witch: string;
        Elemental: string;
        Owners: string;
        Dragon: string;
        Maidforce: string;
        Delinquent: string;
        Bast: string;
        Elf: string;
        AncientRobot: string;
        ShadowClan: string;
        Debate: string;
        Wolfhunter: string;
        Extraplanar: string;
        DubiousWitch: string;
        Virus: string;
        Dollsmith: string;
        Warden: string;
    };
    let KinkyDungeonFactionRelationsBase: {
        Player: {
            Enemy: number;
            Jail: number;
            Chase: number;
            Prisoner: number;
            KinkyConstruct: number;
            Plant: number;
            Slime: number;
            Latex: number;
            Mold: number;
            Beast: number;
            DragonQueen: number;
            Bountyhunter: number;
            Bandit: number;
            Alchemist: number;
            Nevermere: number;
            Apprentice: number;
            Dressmaker: number;
            Witch: number;
            Elemental: number;
            Dragon: number;
            Maidforce: number;
            Bast: number;
            Elf: number;
            Mushy: number;
            AncientRobot: number;
            Angel: number;
            Demon: number;
        };
        Angel: {
            Demon: number;
            Ghost: number;
            Elemental: number;
            Dragon: number;
            AncientRobot: number;
            Nevermere: number;
            Enemy: number;
        };
        Natural: {
            Player: number;
            Jail: number;
            Chase: number;
        };
        Barrel: {
            Jail: number;
            Chase: number;
        };
        Door: {
            Player: number;
            Jail: number;
            Chase: number;
        };
        Ghost: {
            Player: number;
            Jail: number;
            Chase: number;
        };
        Observer: {
            Player: number;
            Jail: number;
            Chase: number;
        };
        Rock: {
            Player: number;
            Jail: number;
            Chase: number;
        };
        Rebel: {
            Jail: number;
            Chase: number;
        };
        Adventurer: {
            Jail: number;
            Chase: number;
        };
        Demon: {
            Elf: number;
            Bast: number;
            Witch: number;
            Jail: number;
            Chase: number;
            Bountyhunter: number;
            Bandit: number;
            Alchemist: number;
            Nevermere: number;
            Apprentice: number;
            Dressmaker: number;
            Elemental: number;
            Dragon: number;
            Maidforce: number;
            Mushy: number;
            AncientRobot: number;
        };
        Enemy: {
            KinkyConstruct: number;
            Dragon: number;
            Bountyhunter: number;
            Bandit: number;
            Alchemist: number;
            Nevermere: number;
            Apprentice: number;
            Dressmaker: number;
            Witch: number;
            Elemental: number;
            Maidforce: number;
            Bast: number;
            Elf: number;
            Mushy: number;
            AncientRobot: number;
        };
        dollsmith: {};
        Dollsmith: {
            KinkyConstruct: number;
            Dragon: number;
            Bountyhunter: number;
            Bandit: number;
            Alchemist: number;
            Nevermere: number;
            Apprentice: number;
            Dressmaker: number;
            Witch: number;
            Elemental: number;
            Maidforce: number;
            Bast: number;
            Elf: number;
            Mushy: number;
            AncientRobot: number;
            Player: number;
        };
        Warden: {
            KinkyConstruct: number;
            AncientRobot: number;
            Player: number;
            Jail: number;
        };
        Virus: {
            Player: number;
            Chase: number;
            Jail: number;
        };
        DubiousWitch: {
            Player: number;
            Witch: number;
            Chase: number;
            Jail: number;
        };
        Extraplanar: {
            Player: number;
            Demon: number;
            Chase: number;
            Jail: number;
        };
        Owners: {
            Player: number;
            Demon: number;
            Elemental: number;
            Chase: number;
            Jail: number;
        };
        Delinquent: {
            Player: number;
            Maidforce: number;
            Chase: number;
            Jail: number;
        };
        ShadowClan: {
            Player: number;
            Demon: number;
            Angel: number;
            Chase: number;
            Jail: number;
        };
        Fuuka: {
            Player: number;
            Chase: number;
            Jail: number;
        };
        RopeDojo: {
            Player: number;
            Chase: number;
            Jail: number;
        };
        DollShoppe: {
            Player: number;
            Chase: number;
            Dressmaker: number;
            Jail: number;
        };
        Debate: {
            Player: number;
            Chase: number;
            Jail: number;
        };
        Wolfhunter: {
            Player: number;
            Nevermere: number;
            Chase: number;
            Jail: number;
        };
        Trap: {
            Enemy: number;
            Jail: number;
            Prisoner: number;
            Ambush: number;
            Boss: number;
            KinkyConstruct: number;
            Plant: number;
            Slime: number;
            Mold: number;
            Beast: number;
            DragonQueen: number;
            Bountyhunter: number;
            Bandit: number;
            Alchemist: number;
            Nevermere: number;
            Apprentice: number;
            Dressmaker: number;
            Witch: number;
            Elemental: number;
            Dragon: number;
            Maidforce: number;
            Bast: number;
            Elf: number;
            Mushy: number;
            AncientRobot: number;
            Delinquent: number;
            Virus: number;
            ShadowClan: number;
            DollShoppe: number;
            RopeDojo: number;
            Fuuka: number;
            DubiousWitch: number;
            Extraplanar: number;
            Owners: number;
            Debate: number;
            Dollsmith: number;
            Wolfhunter: number;
            Observer: number;
            Angel: number;
            Demon: number;
            Chase: number;
        };
        Boss: {
            Chase: number;
            Enemy: number;
        };
        Chase: {};
        Ambush: {
            Player: number;
            Jail: number;
            Chase: number;
        };
        Curse: {
            Player: number;
            Jail: number;
            Chase: number;
        };
        Prisoner: {};
        Jail: {};
        Slime: {
            Jail: number;
            Chase: number;
            Bountyhunter: number;
            Bandit: number;
            Alchemist: number;
            Nevermere: number;
            Apprentice: number;
            Dressmaker: number;
            Elemental: number;
            Dragon: number;
            Maidforce: number;
            Bast: number;
            Elf: number;
            Mushy: number;
        };
        Latex: {
            Jail: number;
            Chase: number;
            Maidforce: number;
        };
        Mold: {
            Jail: number;
            Chase: number;
            Enemy: number;
            Bountyhunter: number;
            Bandit: number;
            Alchemist: number;
            Nevermere: number;
            Apprentice: number;
            Dressmaker: number;
            Witch: number;
            Elemental: number;
            Dragon: number;
            Maidforce: number;
            Bast: number;
            Elf: number;
            Mushy: number;
            AncientRobot: number;
        };
        Beast: {
            Jail: number;
            Chase: number;
            Bountyhunter: number;
            Bandit: number;
            Alchemist: number;
            Nevermere: number;
            Apprentice: number;
            Dressmaker: number;
            Witch: number;
            Elemental: number;
            Dragon: number;
            Maidforce: number;
            Mushy: number;
            AncientRobot: number;
        };
        DragonQueen: {
            Jail: number;
            Chase: number;
            Bountyhunter: number;
            Bandit: number;
            Alchemist: number;
            Nevermere: number;
            Apprentice: number;
            Dressmaker: number;
            Witch: number;
            Elemental: number;
            Dragon: number;
            Maidforce: number;
            Mushy: number;
            AncientRobot: number;
        };
        KinkyConstruct: {
            Jail: number;
            Chase: number;
            Apprentice: number;
            Dragon: number;
        };
        Plant: {
            Jail: number;
            Chase: number;
        };
        Nevermere: {
            Alchemist: number;
            Bast: number;
            Mushy: number;
            Bandit: number;
            Apprentice: number;
            AncientRobot: number;
        };
        Alchemist: {
            Bandit: number;
            AncientRobot: number;
            Dressmaker: number;
        };
        Bountyhunter: {
            Jail: number;
            Dragon: number;
            Bandit: number;
            Maidforce: number;
            Witch: number;
            Dressmaker: number;
            Nevermere: number;
        };
        Elf: {
            Mushy: number;
            Beast: number;
            Plant: number;
        };
        Bast: {
            Elf: number;
            Witch: number;
            Beast: number;
        };
        Bandit: {
            Mushy: number;
            Apprentice: number;
            Witch: number;
        };
        Elemental: {
            KinkyConstruct: number;
            Bandit: number;
            Elf: number;
            Bast: number;
            Dragon: number;
            AncientRobot: number;
        };
        AncientRobot: {
            Bast: number;
            Elf: number;
        };
        Dragon: {
            Jail: number;
            Apprentice: number;
            Bandit: number;
            Witch: number;
            Alchemist: number;
            Beast: number;
            Mushy: number;
        };
        Mushy: {
            Alchemist: number;
            Elemental: number;
        };
        Witch: {
            Elf: number;
        };
        Dressmaker: {
            Witch: number;
            Nevermere: number;
            Bandit: number;
            Dragon: number;
        };
        Apprentice: {
            Jail: number;
            Elf: number;
        };
        Necromancer: {
            Jail: number;
            Witch: number;
            Apprentice: number;
            Dragon: number;
            Maidforce: number;
            Alchemist: number;
            Nevermere: number;
        };
        Maidforce: {
            Alchemist: number;
            Jail: number;
            Dragon: number;
            Apprentice: number;
            Bandit: number;
            Witch: number;
        };
    };
    let KinkyDungeonFactionRelations: {
        Player: {
            Enemy: number;
            Jail: number;
            Chase: number;
            Prisoner: number;
            KinkyConstruct: number;
            Plant: number;
            Slime: number;
            Latex: number;
            Mold: number;
            Beast: number;
            DragonQueen: number;
            Bountyhunter: number;
            Bandit: number;
            Alchemist: number;
            Nevermere: number;
            Apprentice: number;
            Dressmaker: number;
            Witch: number;
            Elemental: number;
            Dragon: number;
            Maidforce: number;
            Bast: number;
            Elf: number;
            Mushy: number;
            AncientRobot: number;
            Angel: number;
            Demon: number;
        };
        Angel: {
            Demon: number;
            Ghost: number;
            Elemental: number;
            Dragon: number;
            AncientRobot: number;
            Nevermere: number;
            Enemy: number;
        };
        Natural: {
            Player: number;
            Jail: number;
            Chase: number;
        };
        Barrel: {
            Jail: number;
            Chase: number;
        };
        Door: {
            Player: number;
            Jail: number;
            Chase: number;
        };
        Ghost: {
            Player: number;
            Jail: number;
            Chase: number;
        };
        Observer: {
            Player: number;
            Jail: number;
            Chase: number;
        };
        Rock: {
            Player: number;
            Jail: number;
            Chase: number;
        };
        Rebel: {
            Jail: number;
            Chase: number;
        };
        Adventurer: {
            Jail: number;
            Chase: number;
        };
        Demon: {
            Elf: number;
            Bast: number;
            Witch: number;
            Jail: number;
            Chase: number;
            Bountyhunter: number;
            Bandit: number;
            Alchemist: number;
            Nevermere: number;
            Apprentice: number;
            Dressmaker: number;
            Elemental: number;
            Dragon: number;
            Maidforce: number;
            Mushy: number;
            AncientRobot: number;
        };
        Enemy: {
            KinkyConstruct: number;
            Dragon: number;
            Bountyhunter: number;
            Bandit: number;
            Alchemist: number;
            Nevermere: number;
            Apprentice: number;
            Dressmaker: number;
            Witch: number;
            Elemental: number;
            Maidforce: number;
            Bast: number;
            Elf: number;
            Mushy: number;
            AncientRobot: number;
        };
        dollsmith: {};
        Dollsmith: {
            KinkyConstruct: number;
            Dragon: number;
            Bountyhunter: number;
            Bandit: number;
            Alchemist: number;
            Nevermere: number;
            Apprentice: number;
            Dressmaker: number;
            Witch: number;
            Elemental: number;
            Maidforce: number;
            Bast: number;
            Elf: number;
            Mushy: number;
            AncientRobot: number;
            Player: number;
        };
        Warden: {
            KinkyConstruct: number;
            AncientRobot: number;
            Player: number;
            Jail: number;
        };
        Virus: {
            Player: number;
            Chase: number;
            Jail: number;
        };
        DubiousWitch: {
            Player: number;
            Witch: number;
            Chase: number;
            Jail: number;
        };
        Extraplanar: {
            Player: number;
            Demon: number;
            Chase: number;
            Jail: number;
        };
        Owners: {
            Player: number;
            Demon: number;
            Elemental: number;
            Chase: number;
            Jail: number;
        };
        Delinquent: {
            Player: number;
            Maidforce: number;
            Chase: number;
            Jail: number;
        };
        ShadowClan: {
            Player: number;
            Demon: number;
            Angel: number;
            Chase: number;
            Jail: number;
        };
        Fuuka: {
            Player: number;
            Chase: number;
            Jail: number;
        };
        RopeDojo: {
            Player: number;
            Chase: number;
            Jail: number;
        };
        DollShoppe: {
            Player: number;
            Chase: number;
            Dressmaker: number;
            Jail: number;
        };
        Debate: {
            Player: number;
            Chase: number;
            Jail: number;
        };
        Wolfhunter: {
            Player: number;
            Nevermere: number;
            Chase: number;
            Jail: number;
        };
        Trap: {
            Enemy: number;
            Jail: number;
            Prisoner: number;
            Ambush: number;
            Boss: number;
            KinkyConstruct: number;
            Plant: number;
            Slime: number;
            Mold: number;
            Beast: number;
            DragonQueen: number;
            Bountyhunter: number;
            Bandit: number;
            Alchemist: number;
            Nevermere: number;
            Apprentice: number;
            Dressmaker: number;
            Witch: number;
            Elemental: number;
            Dragon: number;
            Maidforce: number;
            Bast: number;
            Elf: number;
            Mushy: number;
            AncientRobot: number;
            Delinquent: number;
            Virus: number;
            ShadowClan: number;
            DollShoppe: number;
            RopeDojo: number;
            Fuuka: number;
            DubiousWitch: number;
            Extraplanar: number;
            Owners: number;
            Debate: number;
            Dollsmith: number;
            Wolfhunter: number;
            Observer: number;
            Angel: number;
            Demon: number;
            Chase: number;
        };
        Boss: {
            Chase: number;
            Enemy: number;
        };
        Chase: {};
        Ambush: {
            Player: number;
            Jail: number;
            Chase: number;
        };
        Curse: {
            Player: number;
            Jail: number;
            Chase: number;
        };
        Prisoner: {};
        Jail: {};
        Slime: {
            Jail: number;
            Chase: number;
            Bountyhunter: number;
            Bandit: number;
            Alchemist: number;
            Nevermere: number;
            Apprentice: number;
            Dressmaker: number;
            Elemental: number;
            Dragon: number;
            Maidforce: number;
            Bast: number;
            Elf: number;
            Mushy: number;
        };
        Latex: {
            Jail: number;
            Chase: number;
            Maidforce: number;
        };
        Mold: {
            Jail: number;
            Chase: number;
            Enemy: number;
            Bountyhunter: number;
            Bandit: number;
            Alchemist: number;
            Nevermere: number;
            Apprentice: number;
            Dressmaker: number;
            Witch: number;
            Elemental: number;
            Dragon: number;
            Maidforce: number;
            Bast: number;
            Elf: number;
            Mushy: number;
            AncientRobot: number;
        };
        Beast: {
            Jail: number;
            Chase: number;
            Bountyhunter: number;
            Bandit: number;
            Alchemist: number;
            Nevermere: number;
            Apprentice: number;
            Dressmaker: number;
            Witch: number;
            Elemental: number;
            Dragon: number;
            Maidforce: number;
            Mushy: number;
            AncientRobot: number;
        };
        DragonQueen: {
            Jail: number;
            Chase: number;
            Bountyhunter: number;
            Bandit: number;
            Alchemist: number;
            Nevermere: number;
            Apprentice: number;
            Dressmaker: number;
            Witch: number;
            Elemental: number;
            Dragon: number;
            Maidforce: number;
            Mushy: number;
            AncientRobot: number;
        };
        KinkyConstruct: {
            Jail: number;
            Chase: number;
            Apprentice: number;
            Dragon: number;
        };
        Plant: {
            Jail: number;
            Chase: number;
        };
        Nevermere: {
            Alchemist: number;
            Bast: number;
            Mushy: number;
            Bandit: number;
            Apprentice: number;
            AncientRobot: number;
        };
        Alchemist: {
            Bandit: number;
            AncientRobot: number;
            Dressmaker: number;
        };
        Bountyhunter: {
            Jail: number;
            Dragon: number;
            Bandit: number;
            Maidforce: number;
            Witch: number;
            Dressmaker: number;
            Nevermere: number;
        };
        Elf: {
            Mushy: number;
            Beast: number;
            Plant: number;
        };
        Bast: {
            Elf: number;
            Witch: number;
            Beast: number;
        };
        Bandit: {
            Mushy: number;
            Apprentice: number;
            Witch: number;
        };
        Elemental: {
            KinkyConstruct: number;
            Bandit: number;
            Elf: number;
            Bast: number;
            Dragon: number;
            AncientRobot: number;
        };
        AncientRobot: {
            Bast: number;
            Elf: number;
        };
        Dragon: {
            Jail: number;
            Apprentice: number;
            Bandit: number;
            Witch: number;
            Alchemist: number;
            Beast: number;
            Mushy: number;
        };
        Mushy: {
            Alchemist: number;
            Elemental: number;
        };
        Witch: {
            Elf: number;
        };
        Dressmaker: {
            Witch: number;
            Nevermere: number;
            Bandit: number;
            Dragon: number;
        };
        Apprentice: {
            Jail: number;
            Elf: number;
        };
        Necromancer: {
            Jail: number;
            Witch: number;
            Apprentice: number;
            Dragon: number;
            Maidforce: number;
            Alchemist: number;
            Nevermere: number;
        };
        Maidforce: {
            Alchemist: number;
            Jail: number;
            Dragon: number;
            Apprentice: number;
            Bandit: number;
            Witch: number;
        };
    };
    function KDFactionRelation(a: string, b: string): number;
    let KDFactionRelations: Map<string, Map<string, number>>;
    function KDInitFactions(Reset?: boolean): void;
    function KDSetFactionRelation(a: string, b: string, relation: number): void;
    function KDChangeFactionRelation(a: string, b: string, amount: number, AffectRivals?: boolean): void;
    let KDNeedsParams: {
        FrustrationPerTurn: number;
        FrustrationPerDesire: number;
        FrustrationPerOrgasm: number;
        FrustrationPerVibeLevel: number;
        PassionPerTurn: number;
        PassionPerDesire: number;
        PassionPerOrgasm: number;
        PassionPerVibeLevel: number;
        PassionPerPlay: number;
    };
    function KDFixNeeds(): void;
    function KDTickNeeds(delta: number): void;
    function KDNeedsPlaySelf(_data: any, _mult?: number): void;
    function KDNeedsOrgasm(_data: any, _mult?: number): void;
    function KDNeedsEdge(_data: any, _mult?: number): void;
    function KDNeedsDeny(_data: any, _mult?: number): void;
    let KDBaseJailTickSub: number;
    let KDJailEvents: Record<string, {
        weight: (guard: any, xx: any, yy: any) => number;
        trigger: (guard: any, xx: any, yy: any) => void;
    }>;
    function KDCanSpawnShopkeeper(override?: boolean): boolean;
    type guardAction_num = (guard: entity, xx: number, yy: number) => number;
    type guardAction_bool = (guard: entity, xx: number, yy: number) => boolean;
    type guardAction_void = (guard: entity, xx: number, yy: number, delta?: number) => void;
    type guardActionEntry = {
        weight: guardAction_num;
        assignable?: guardAction_bool;
        assign: guardAction_void;
        handle: guardAction_void;
    };
    let KDGuardActions: Record<string, guardActionEntry>;
    let KinkyDungeonJailRemoveRestraintsTimerMin: number;
    let KinkyDungeonJailedOnce: boolean;
    let KDJailReleaseTurns: {
        minSub: number;
        releaseTurns: number;
    }[];
    let KDSecurityLevelHiSec: number;
    let KDJailOutfits: Record<string, {
        overridelowerpriority: boolean;
        priority: number;
        jail: boolean;
        parole: boolean;
        restraints: KDJailRestraint[];
    }>;
    let KDJailConditions: Record<string, (r: KDJailRestraint) => boolean>;
    function KDRunTests(): void;
    function KDTestMapGen(count: number, Ranges: number[], Checkpoints: string[]): boolean;
    function KDTestFullRunthrough(GameLoops: number, Init: boolean, NGP: boolean): boolean;
    function KDTestjailer(iter: number): void;
    function KDAddTestVariant(name: string): void;
    function KDListMissingModels(): void;
    function KDCheckForMissingModelLayers(): void;
    function KDCheckForBadModels(): void;
    function KDGetMissingSpellNames(): string;
    let KDBasicArmorWeight: number;
    let KDBasicArmorWeight_Cursed: number;
    let KDEnchantedRestraintsWeight: number;
    let KDAdvancedArmorWeight: number;
    let KDAdvancedArmorWeight_Cursed: number;
    let KD_hexchance_Default: number;
    let KD_hexscale_Default: number;
    let KD_enchantchance_Default: number;
    let KD_enchantscale_Default: number;
    let KD_hexchance_EnchantedRestraints: number;
    let KD_hexscale_EnchantedRestraints: number;
    let KDBasicArmor: {
        name: string;
        minLevel: number;
        weight: number;
        armor: string;
        cursesuffix: string;
        hexlist: string;
        enchantlist: string;
        hexchance: number;
        enchantchance: number;
        alwaysenchanthex: boolean;
        hexscale: number;
        enchantscale: number;
        unlockcurse: string[];
        hexlevelmin: number;
        hexlevelmax: number;
        enchantlevelmin: number;
        enchantlevelmax: number;
        nouncursed: string[];
        message: string;
        messageColor: string;
        messageTime: number;
        allFloors: boolean;
    }[];
    let KDAdvancedArmor: {
        name: string;
        minLevel: number;
        weight: number;
        armor: string;
        cursesuffix: string;
        hexlist: string;
        enchantlist: string;
        hexchance: number;
        enchantchance: number;
        alwaysenchanthex: boolean;
        hexscale: number;
        enchantscale: number;
        unlockcurse: string[];
        hexlevelmin: number;
        hexlevelmax: number;
        enchantlevelmin: number;
        enchantlevelmax: number;
        nouncursed: string[];
        message: string;
        messageColor: string;
        messageTime: number;
        allFloors: boolean;
    }[];
    let KDGoldArmor: any[];
    let KDGoldArmor2: any[];
    let KDGoldArmorGoddess: any[];
    let KDGoldArmor2Goddess: any[];
    let KDSilverArmor: any[];
    let KDEnchantedRestraints: ({
        name: string;
        minLevel: number;
        weight: number;
        armortags: string[];
        armor: string;
        cursesuffix: string;
        maxEnchants: number;
        faction: string;
        hexlist: string;
        enchantlist: string;
        hexchance: number;
        enchantchance: number;
        alwaysenchanthex: boolean;
        hexscale: number;
        unlockcurse: string[];
        hexlevelmin: number;
        hexlevelmax: number;
        enchantlevelmin: number;
        enchantlevelmax: number;
        message: string;
        messageColor: string;
        messageTime: number;
        allFloors: boolean;
        amtMult?: undefined;
    } | {
        name: string;
        minLevel: number;
        weight: number;
        armortags: string[];
        armor: string;
        cursesuffix: string;
        maxEnchants: number;
        amtMult: number;
        faction: string;
        hexlist: string;
        enchantlist: string;
        hexchance: number;
        enchantchance: number;
        alwaysenchanthex: boolean;
        hexscale: number;
        unlockcurse: string[];
        hexlevelmin: number;
        hexlevelmax: number;
        enchantlevelmin: number;
        enchantlevelmax: number;
        message: string;
        messageColor: string;
        messageTime: number;
        allFloors: boolean;
    } | {
        name: string;
        minLevel: number;
        weight: number;
        armortags: string[];
        armor: string;
        cursesuffix: string;
        amtMult: number;
        faction: string;
        hexlist: string;
        enchantlist: string;
        hexchance: number;
        enchantchance: number;
        alwaysenchanthex: boolean;
        unlockcurse: string[];
        hexlevelmin: number;
        hexlevelmax: number;
        enchantlevelmin: number;
        enchantlevelmax: number;
        message: string;
        messageColor: string;
        messageTime: number;
        allFloors: boolean;
        maxEnchants?: undefined;
        hexscale?: undefined;
    })[];
    let KDShadowRestraints: any[];
    let KinkyDungeonLootTable: {
        rubble: ({
            name: string;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            prerequisites?: undefined;
            key?: undefined;
            count?: undefined;
            weapon?: undefined;
            noweapon?: undefined;
            arousalMode?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            prerequisites: string[];
            key?: undefined;
            count?: undefined;
            weapon?: undefined;
            noweapon?: undefined;
            arousalMode?: undefined;
        } | {
            name: string;
            key: boolean;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            prerequisites?: undefined;
            count?: undefined;
            weapon?: undefined;
            noweapon?: undefined;
            arousalMode?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            count: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            prerequisites?: undefined;
            key?: undefined;
            weapon?: undefined;
            noweapon?: undefined;
            arousalMode?: undefined;
        } | {
            name: string;
            minLevel: number;
            weapon: string;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            noweapon: string[];
            prerequisites?: undefined;
            key?: undefined;
            count?: undefined;
            arousalMode?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            noweapon: string[];
            prerequisites?: undefined;
            key?: undefined;
            count?: undefined;
            weapon?: undefined;
            arousalMode?: undefined;
        } | {
            name: string;
            arousalMode: boolean;
            minLevel: number;
            weight: number;
            weapon: string;
            noweapon: string[];
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            prerequisites?: undefined;
            key?: undefined;
            count?: undefined;
        })[];
        shelf: ({
            name: string;
            minLevel: number;
            weight: number;
            weapon: string;
            noweapon: string[];
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            key?: undefined;
        } | {
            name: string;
            key: boolean;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            weapon?: undefined;
            noweapon?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            weapon?: undefined;
            noweapon?: undefined;
            key?: undefined;
        })[];
        pearl: {
            name: string;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            prerequisites: string[];
        }[];
        shadow: any[];
        kitty: ({
            name: string;
            minLevel: number;
            weight: number;
            armor: string;
            amtMult: number;
            maxEnchants: number;
            cursesuffix: string;
            prerequisites: string[];
            faction: string;
            hexlist: string;
            enchantlist: string;
            hexchance: number;
            enchantchance: number;
            alwaysenchanthex: boolean;
            hexscale: number;
            unlockcurse: string[];
            hexlevelmin: number;
            hexlevelmax: number;
            enchantlevelmin: number;
            enchantlevelmax: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            weapon?: undefined;
            noweapon?: undefined;
            goddess?: undefined;
            goddessWeight?: undefined;
            max?: undefined;
            count?: undefined;
            submissive?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            weapon: string;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            noweapon: string[];
            armor?: undefined;
            amtMult?: undefined;
            maxEnchants?: undefined;
            cursesuffix?: undefined;
            prerequisites?: undefined;
            faction?: undefined;
            hexlist?: undefined;
            enchantlist?: undefined;
            hexchance?: undefined;
            enchantchance?: undefined;
            alwaysenchanthex?: undefined;
            hexscale?: undefined;
            unlockcurse?: undefined;
            hexlevelmin?: undefined;
            hexlevelmax?: undefined;
            enchantlevelmin?: undefined;
            enchantlevelmax?: undefined;
            goddess?: undefined;
            goddessWeight?: undefined;
            max?: undefined;
            count?: undefined;
            submissive?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            weapon: string;
            goddess: string;
            goddessWeight: number;
            noweapon: string[];
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            armor?: undefined;
            amtMult?: undefined;
            maxEnchants?: undefined;
            cursesuffix?: undefined;
            prerequisites?: undefined;
            faction?: undefined;
            hexlist?: undefined;
            enchantlist?: undefined;
            hexchance?: undefined;
            enchantchance?: undefined;
            alwaysenchanthex?: undefined;
            hexscale?: undefined;
            unlockcurse?: undefined;
            hexlevelmin?: undefined;
            hexlevelmax?: undefined;
            enchantlevelmin?: undefined;
            enchantlevelmax?: undefined;
            max?: undefined;
            count?: undefined;
            submissive?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            armor?: undefined;
            amtMult?: undefined;
            maxEnchants?: undefined;
            cursesuffix?: undefined;
            prerequisites?: undefined;
            faction?: undefined;
            hexlist?: undefined;
            enchantlist?: undefined;
            hexchance?: undefined;
            enchantchance?: undefined;
            alwaysenchanthex?: undefined;
            hexscale?: undefined;
            unlockcurse?: undefined;
            hexlevelmin?: undefined;
            hexlevelmax?: undefined;
            enchantlevelmin?: undefined;
            enchantlevelmax?: undefined;
            weapon?: undefined;
            noweapon?: undefined;
            goddess?: undefined;
            goddessWeight?: undefined;
            max?: undefined;
            count?: undefined;
            submissive?: undefined;
        } | {
            name: string;
            max: number;
            minLevel: number;
            weight: number;
            count: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            submissive: number;
            armor?: undefined;
            amtMult?: undefined;
            maxEnchants?: undefined;
            cursesuffix?: undefined;
            prerequisites?: undefined;
            faction?: undefined;
            hexlist?: undefined;
            enchantlist?: undefined;
            hexchance?: undefined;
            enchantchance?: undefined;
            alwaysenchanthex?: undefined;
            hexscale?: undefined;
            unlockcurse?: undefined;
            hexlevelmin?: undefined;
            hexlevelmax?: undefined;
            enchantlevelmin?: undefined;
            enchantlevelmax?: undefined;
            weapon?: undefined;
            noweapon?: undefined;
            goddess?: undefined;
            goddessWeight?: undefined;
        })[];
        robot: ({
            name: string;
            minLevel: number;
            weight: number;
            weapon: string;
            noweapon: string[];
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            max?: undefined;
            count?: undefined;
            submissive?: undefined;
            goddess?: undefined;
            goddessWeight?: undefined;
        } | {
            name: string;
            max: number;
            minLevel: number;
            weight: number;
            count: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            submissive: number;
            weapon?: undefined;
            noweapon?: undefined;
            goddess?: undefined;
            goddessWeight?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            weapon?: undefined;
            noweapon?: undefined;
            max?: undefined;
            count?: undefined;
            submissive?: undefined;
            goddess?: undefined;
            goddessWeight?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            weapon: string;
            goddess: string;
            goddessWeight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            noweapon: string[];
            max?: undefined;
            count?: undefined;
            submissive?: undefined;
        })[];
        lessershadow: any[];
        storage: ({
            name: string;
            key: boolean;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            weapon?: undefined;
            noweapon?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            key?: undefined;
            weapon?: undefined;
            noweapon?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            weapon: string;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            noweapon: string[];
            key?: undefined;
        })[];
        kinky: ({
            name: string;
            minLevel: number;
            weight: number;
            count: number;
            armortags: string[];
            armor: string;
            faction: string;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            weaponlist?: undefined;
            weapon?: undefined;
            noweapon?: undefined;
        } | {
            name: string;
            weaponlist: string;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            count?: undefined;
            armortags?: undefined;
            armor?: undefined;
            faction?: undefined;
            weapon?: undefined;
            noweapon?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            weapon: string;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            noweapon: string[];
            count?: undefined;
            armortags?: undefined;
            armor?: undefined;
            faction?: undefined;
            weaponlist?: undefined;
        })[];
        blue: {
            name: string;
            magic: boolean;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            max: number;
        }[];
        tutorial1: {
            name: string;
            minLevel: number;
            weight: number;
            lock: string;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            prerequisites: string[];
            power: number;
        }[];
        tutorial2: {
            name: string;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            prerequisites: string[];
            power: number;
        }[];
        magicWeapon: {
            name: string;
            weaponlist: string;
            enchantlist: string;
            enchantchance: number;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
        }[];
        pair: {
            name: string;
            minLevel: number;
            weight: number;
            armor: string;
            amtMult: number;
            maxEnchants: number;
            minEnchants: number;
            noForceEquip: boolean;
            unlockcurse: string[];
            cursechance: number;
            cursescale: number;
            cursesuffix: string;
            enchantlist: string;
            enchantchance: number;
            enchantlevelmin: number;
            enchantlevelmax: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
        }[];
        gendmgtest: {
            name: string;
            minLevel: number;
            weight: number;
            armortags: string[];
            armor: string;
            cursesuffix: string;
            maxEnchants: number;
            faction: string;
            hexlist: string;
            enchantlist: string;
            hexchance: number;
            enchantchance: number;
            alwaysenchanthex: boolean;
            hexscale: number;
            unlockcurse: string[];
            hexlevelmin: number;
            hexlevelmax: number;
            enchantlevelmin: number;
            enchantlevelmax: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
        }[];
        chest: ({
            name: string;
            minLevel: number;
            weight: number;
            armor: string;
            cursesuffix: string;
            hexlist: string;
            enchantlist: string;
            hexchance: number;
            enchantchance: number;
            alwaysenchanthex: boolean;
            hexscale: number;
            enchantscale: number;
            unlockcurse: string[];
            hexlevelmin: number;
            hexlevelmax: number;
            enchantlevelmin: number;
            enchantlevelmax: number;
            nouncursed: string[];
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
        } | {
            name: string;
            spell: string;
            nospell: string[];
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            prerequisites: string[];
            noweapon?: undefined;
            weapon?: undefined;
            redspecial?: undefined;
            key?: undefined;
            arousalMode?: undefined;
            weaponlist?: undefined;
            enchantlist?: undefined;
            enchantchance?: undefined;
            notag?: undefined;
            trap?: undefined;
            power?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            noweapon: string[];
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            spell?: undefined;
            nospell?: undefined;
            prerequisites?: undefined;
            weapon?: undefined;
            redspecial?: undefined;
            key?: undefined;
            arousalMode?: undefined;
            weaponlist?: undefined;
            enchantlist?: undefined;
            enchantchance?: undefined;
            notag?: undefined;
            trap?: undefined;
            power?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            spell?: undefined;
            nospell?: undefined;
            prerequisites?: undefined;
            noweapon?: undefined;
            weapon?: undefined;
            redspecial?: undefined;
            key?: undefined;
            arousalMode?: undefined;
            weaponlist?: undefined;
            enchantlist?: undefined;
            enchantchance?: undefined;
            notag?: undefined;
            trap?: undefined;
            power?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            weapon: string;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            noweapon: string[];
            spell?: undefined;
            nospell?: undefined;
            prerequisites?: undefined;
            redspecial?: undefined;
            key?: undefined;
            arousalMode?: undefined;
            weaponlist?: undefined;
            enchantlist?: undefined;
            enchantchance?: undefined;
            notag?: undefined;
            trap?: undefined;
            power?: undefined;
        } | {
            name: string;
            redspecial: number;
            key: boolean;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            spell?: undefined;
            nospell?: undefined;
            prerequisites?: undefined;
            noweapon?: undefined;
            weapon?: undefined;
            arousalMode?: undefined;
            weaponlist?: undefined;
            enchantlist?: undefined;
            enchantchance?: undefined;
            notag?: undefined;
            trap?: undefined;
            power?: undefined;
        } | {
            name: string;
            arousalMode: boolean;
            minLevel: number;
            weight: number;
            weapon: string;
            noweapon: string[];
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            spell?: undefined;
            nospell?: undefined;
            prerequisites?: undefined;
            redspecial?: undefined;
            key?: undefined;
            weaponlist?: undefined;
            enchantlist?: undefined;
            enchantchance?: undefined;
            notag?: undefined;
            trap?: undefined;
            power?: undefined;
        } | {
            name: string;
            weaponlist: string;
            enchantlist: string;
            enchantchance: number;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            spell?: undefined;
            nospell?: undefined;
            prerequisites?: undefined;
            noweapon?: undefined;
            weapon?: undefined;
            redspecial?: undefined;
            key?: undefined;
            arousalMode?: undefined;
            notag?: undefined;
            trap?: undefined;
            power?: undefined;
        } | {
            name: string;
            notag: string[];
            arousalMode: boolean;
            trap: boolean;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            prerequisites: string[];
            power: number;
            spell?: undefined;
            nospell?: undefined;
            noweapon?: undefined;
            weapon?: undefined;
            redspecial?: undefined;
            key?: undefined;
            weaponlist?: undefined;
            enchantlist?: undefined;
            enchantchance?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            prerequisites: string[];
            spell?: undefined;
            nospell?: undefined;
            noweapon?: undefined;
            weapon?: undefined;
            redspecial?: undefined;
            key?: undefined;
            arousalMode?: undefined;
            weaponlist?: undefined;
            enchantlist?: undefined;
            enchantchance?: undefined;
            notag?: undefined;
            trap?: undefined;
            power?: undefined;
        })[];
        lost_items: {
            name: string;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            prerequisites: string[];
        }[];
        lost_clothes: {
            name: string;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
        }[];
        cache: ({
            name: string;
            minLevel: number;
            weight: number;
            armortags: string[];
            armor: string;
            cursesuffix: string;
            maxEnchants: number;
            faction: string;
            hexlist: string;
            enchantlist: string;
            hexchance: number;
            enchantchance: number;
            alwaysenchanthex: boolean;
            hexscale: number;
            unlockcurse: string[];
            hexlevelmin: number;
            hexlevelmax: number;
            enchantlevelmin: number;
            enchantlevelmax: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            amtMult?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            armortags: string[];
            armor: string;
            cursesuffix: string;
            maxEnchants: number;
            amtMult: number;
            faction: string;
            hexlist: string;
            enchantlist: string;
            hexchance: number;
            enchantchance: number;
            alwaysenchanthex: boolean;
            hexscale: number;
            unlockcurse: string[];
            hexlevelmin: number;
            hexlevelmax: number;
            enchantlevelmin: number;
            enchantlevelmax: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            armortags: string[];
            armor: string;
            cursesuffix: string;
            amtMult: number;
            faction: string;
            hexlist: string;
            enchantlist: string;
            hexchance: number;
            enchantchance: number;
            alwaysenchanthex: boolean;
            unlockcurse: string[];
            hexlevelmin: number;
            hexlevelmax: number;
            enchantlevelmin: number;
            enchantlevelmax: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            maxEnchants?: undefined;
            hexscale?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            armor: string;
            cursesuffix: string;
            hexlist: string;
            enchantlist: string;
            hexchance: number;
            enchantchance: number;
            alwaysenchanthex: boolean;
            hexscale: number;
            enchantscale: number;
            unlockcurse: string[];
            hexlevelmin: number;
            hexlevelmax: number;
            enchantlevelmin: number;
            enchantlevelmax: number;
            nouncursed: string[];
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            noweapon?: undefined;
            weapon?: undefined;
            goddess?: undefined;
            goddessWeight?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            noweapon: string[];
            weapon?: undefined;
            goddess?: undefined;
            goddessWeight?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            weapon: string;
            noweapon: string[];
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            goddess?: undefined;
            goddessWeight?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            weapon: string;
            goddess: string;
            goddessWeight: number;
            noweapon: string[];
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
        })[];
        magicrestraint: ({
            name: string;
            minLevel: number;
            weight: number;
            armortags: string[];
            armor: string;
            cursesuffix: string;
            maxEnchants: number;
            faction: string;
            hexlist: string;
            enchantlist: string;
            hexchance: number;
            enchantchance: number;
            alwaysenchanthex: boolean;
            hexscale: number;
            unlockcurse: string[];
            hexlevelmin: number;
            hexlevelmax: number;
            enchantlevelmin: number;
            enchantlevelmax: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            amtMult?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            armortags: string[];
            armor: string;
            cursesuffix: string;
            maxEnchants: number;
            amtMult: number;
            faction: string;
            hexlist: string;
            enchantlist: string;
            hexchance: number;
            enchantchance: number;
            alwaysenchanthex: boolean;
            hexscale: number;
            unlockcurse: string[];
            hexlevelmin: number;
            hexlevelmax: number;
            enchantlevelmin: number;
            enchantlevelmax: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            armortags: string[];
            armor: string;
            cursesuffix: string;
            amtMult: number;
            faction: string;
            hexlist: string;
            enchantlist: string;
            hexchance: number;
            enchantchance: number;
            alwaysenchanthex: boolean;
            unlockcurse: string[];
            hexlevelmin: number;
            hexlevelmax: number;
            enchantlevelmin: number;
            enchantlevelmax: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            maxEnchants?: undefined;
            hexscale?: undefined;
        })[];
        wizard: ({
            name: string;
            minLevel: number;
            weight: number;
            message: string;
            armor: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            norestraint: string[];
            weapon?: undefined;
            noweapon?: undefined;
            magic?: undefined;
            prerequisites?: undefined;
            hexlist?: undefined;
            enchantlist?: undefined;
            hexchance?: undefined;
            enchantchance?: undefined;
            alwaysenchanthex?: undefined;
            hexscale?: undefined;
            enchantscale?: undefined;
            maxEnchants?: undefined;
            minEnchants?: undefined;
            unlockcurse?: undefined;
            hexlevelmin?: undefined;
            hexlevelmax?: undefined;
            enchantlevelmin?: undefined;
            enchantlevelmax?: undefined;
            nouncursed?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            weapon: string;
            noweapon: string[];
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            armor?: undefined;
            norestraint?: undefined;
            magic?: undefined;
            prerequisites?: undefined;
            hexlist?: undefined;
            enchantlist?: undefined;
            hexchance?: undefined;
            enchantchance?: undefined;
            alwaysenchanthex?: undefined;
            hexscale?: undefined;
            enchantscale?: undefined;
            maxEnchants?: undefined;
            minEnchants?: undefined;
            unlockcurse?: undefined;
            hexlevelmin?: undefined;
            hexlevelmax?: undefined;
            enchantlevelmin?: undefined;
            enchantlevelmax?: undefined;
            nouncursed?: undefined;
        } | {
            name: string;
            magic: boolean;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            prerequisites: string[];
            armor?: undefined;
            norestraint?: undefined;
            weapon?: undefined;
            noweapon?: undefined;
            hexlist?: undefined;
            enchantlist?: undefined;
            hexchance?: undefined;
            enchantchance?: undefined;
            alwaysenchanthex?: undefined;
            hexscale?: undefined;
            enchantscale?: undefined;
            maxEnchants?: undefined;
            minEnchants?: undefined;
            unlockcurse?: undefined;
            hexlevelmin?: undefined;
            hexlevelmax?: undefined;
            enchantlevelmin?: undefined;
            enchantlevelmax?: undefined;
            nouncursed?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            armor: string;
            hexlist: string;
            enchantlist: string;
            hexchance: number;
            enchantchance: number;
            alwaysenchanthex: boolean;
            hexscale: number;
            enchantscale: number;
            maxEnchants: number;
            minEnchants: number;
            unlockcurse: string[];
            hexlevelmin: number;
            hexlevelmax: number;
            enchantlevelmin: number;
            enchantlevelmax: number;
            nouncursed: string[];
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            norestraint?: undefined;
            weapon?: undefined;
            noweapon?: undefined;
            magic?: undefined;
            prerequisites?: undefined;
        })[];
        gold: ({
            name: string;
            minLevel: number;
            weight: number;
            armortags: string[];
            armor: string;
            cursesuffix: string;
            maxEnchants: number;
            faction: string;
            hexlist: string;
            enchantlist: string;
            hexchance: number;
            enchantchance: number;
            alwaysenchanthex: boolean;
            hexscale: number;
            unlockcurse: string[];
            hexlevelmin: number;
            hexlevelmax: number;
            enchantlevelmin: number;
            enchantlevelmax: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            amtMult?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            armortags: string[];
            armor: string;
            cursesuffix: string;
            maxEnchants: number;
            amtMult: number;
            faction: string;
            hexlist: string;
            enchantlist: string;
            hexchance: number;
            enchantchance: number;
            alwaysenchanthex: boolean;
            hexscale: number;
            unlockcurse: string[];
            hexlevelmin: number;
            hexlevelmax: number;
            enchantlevelmin: number;
            enchantlevelmax: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            armortags: string[];
            armor: string;
            cursesuffix: string;
            amtMult: number;
            faction: string;
            hexlist: string;
            enchantlist: string;
            hexchance: number;
            enchantchance: number;
            alwaysenchanthex: boolean;
            unlockcurse: string[];
            hexlevelmin: number;
            hexlevelmax: number;
            enchantlevelmin: number;
            enchantlevelmax: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            maxEnchants?: undefined;
            hexscale?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            max?: undefined;
            count?: undefined;
            submissive?: undefined;
            arousalMode?: undefined;
            norestraint?: undefined;
            armor?: undefined;
        } | {
            name: string;
            max: number;
            minLevel: number;
            weight: number;
            count: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            submissive: number;
            arousalMode?: undefined;
            norestraint?: undefined;
            armor?: undefined;
        } | {
            name: string;
            arousalMode: boolean;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            norestraint: string[];
            max?: undefined;
            count?: undefined;
            submissive?: undefined;
            armor?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            norestraint: string[];
            max?: undefined;
            count?: undefined;
            submissive?: undefined;
            arousalMode?: undefined;
            armor?: undefined;
        } | {
            name: string;
            minLevel: number;
            weight: number;
            armor: string;
            message: string;
            messageColor: string;
            messageTime: number;
            allFloors: boolean;
            norestraint: string[];
            max?: undefined;
            count?: undefined;
            submissive?: undefined;
            arousalMode?: undefined;
        })[];
        lessergold: any[];
        silver: any[];
        RopeQuest: any[];
        LatexQuest: any[];
        LeatherQuest: any[];
        MetalQuest: any[];
        WillQuest: any[];
        ElementsQuest: any[];
        ConjureQuest: any[];
        IllusionQuest: any[];
    };
    type lootEventFunc = (Loot: any, Floor: number, Replacemsg: string, Lock: string, container?: KDContainer) => {
        value: number;
        Replacemsg: string;
    };
    let KDLootEvents: Record<string, lootEventFunc>;
    interface KDMinorLootEntry {
        rarity: number;
        options: any[];
    }
    let KDMinorLootTable: {
        chest: {
            rarity: number;
            extraQuantity: number;
            options: ({
                name: string;
                minLevel: number;
                weight: number;
                allFloors: boolean;
                message: string;
                messageColor: string;
                quantity?: undefined;
                extraQuantity?: undefined;
            } | {
                name: string;
                minLevel: number;
                weight: number;
                quantity: number;
                extraQuantity: number;
                allFloors: boolean;
                message: string;
                messageColor: string;
            } | {
                name: string;
                minLevel: number;
                weight: number;
                quantity: number;
                allFloors: boolean;
                message: string;
                messageColor: string;
                extraQuantity?: undefined;
            })[];
        };
    };
    let KDMusicLoopTracksChance: {
        "AREA1-GRAVEYARD.ogg": number;
        "AREA2-ANCIENTTOMBS.ogg": number;
        "GENERIC-DOLLRACK.ogg": number;
        "AREA4-MAGICLIBRARY.ogg": number;
        "AREA5-UNDERGROUNDJUNGLE.ogg": number;
        "AREA6-CRYSTALCAVE.ogg": number;
        "AREA7-LOSTTEMPLE.ogg": number;
        "AREA8-ORRERY.ogg": number;
        "AREA9-BELLOWS.ogg": number;
        "Shopping.ogg": number;
        "slimy_science_1.ogg": number;
    };
    let KDMusicUpdateTime: number;
    let KDMusicUpdateDuration: number;
    let KDMusicY: number;
    let KDMusicYMax: number;
    let KDMusicYSpeed: number;
    let KDMusicToast: string;
    let WriteMusicToast: boolean;
    function KDSendMusicToast(song: string, extraLen?: number): void;
    function KDDrawMusic(delta: number): void;
    let KDCurrentSong: string;
    let KDNewSong: string;
    let KDLastSong: string;
    let KDCurrentLoops: number;
    let KDCurrentFade: number;
    let KDMusicFadeTime: number;
    let KDMusicFadeInTime: number;
    let KDMusicTickRate: number;
    let KDCurrentMusicSound: HTMLAudioElement;
    let KDCurrentMusicSoundUpdate: any;
    let allowMusic: boolean;
    function KDGetCurrentCheckpoint(): string;
    function KDGetMusicCheckpoint(): string;
    let lastKDMusicTick: number;
    function KDUpdateMusic(): void;
    let KDMusicBusy: boolean;
    let KDMusicForce: boolean;
    function KDPlayMusic(Sound: string, Volume?: number, force?: boolean): void;
    function KDEndMusic(): void;
    let KDDefaultNames: string[];
    let KDNameList: {
        default: string[];
        nevermere: string[];
        bountyhunter: string[];
        japanese: string[];
        elf: string[];
        dragonheart: string[];
        maid: string[];
        russian: string[];
        elemental: string[];
        witch: string[];
        aztec: string[];
        space: string[];
        italian: string[];
        Fuuka: string[];
        TheWarden: string[];
        TheWardenFighter: string[];
        TheWardenWizard: string[];
        TheWardenRogue: string[];
        TheWardenDoll: string[];
        Dollmaker: string[];
        MaidKnightHeavy: string[];
        MaidKnightLight: string[];
        chinese: string[];
        vampire: string[];
        french: string[];
        science: string[];
        cthulu: string[];
        demon: string[];
        cyborg: string[];
        bast: string[];
        DragonGirl: string[];
    };
    function KDDelayedActionPrune(tags: string[]): void;
    function KDAddDelayedAction(action: KDDelayedAction): void;
    let KDDelayedActionUpdate: Record<string, (action: KDDelayedAction) => void>;
    let KDDelayedActionCommit: Record<string, (action: KDDelayedAction) => void>;
    let KDCommanderChokes: Record<string, {
        x: number;
        y: number;
        neighbors: number;
    }>;
    let KDUpdateChokes: boolean;
    let KDStruggleAssisters: Record<string, number>;
    let KDCapturers: Record<string, number>;
    let KDCommanderRoles: Map<number, string>;
    let KDCOMMANDERMAXNEIGHBORS: number;
    let KDChokeTiles: string[];
    function KDCommanderUpdate(delta: number): void;
    function KDCommanderUpdateChokes(_data: KDCommanderOrderData): void;
    function KDCommanderUpdateRoles(data: KDCommanderOrderData): void;
    function KDCommanderUpdateOrders(data: KDCommanderOrderData): void;
    function KDGetOrdersList(enemy: entity, data: KDCommanderOrderData): Record<string, number>;
    let KDAwareEnemies: number;
    let KDEnemiesTargetingPlayer: number;
    let KDAssaulters: number;
    let KDAssaulterList: any[];
    let KDMaxAssaulters: number;
    let KDStationedChokepoints: {};
    let KDStationedChokepointsDist: {};
    let KD_Avg_VX: number;
    let KD_Avg_VY: number;
    let KDCommanderOrders: Record<string, KDCommanderOrder>;
    function KDGetBarricade(enemy: entity, x: number, y: number, checkpoint?: boolean, type?: string[]): string;
    let KDBarricades: Record<string, KDBoobyTrap>;
    function KDGetTrapSpell(enemy: entity, x: number, y: number, checkpoint?: boolean, type?: string[]): string;
    let KDBoobyTraps: Record<string, KDBoobyTrap>;
    function KDWillingToHelp(en: entity, enemy: entity): boolean;
    let KDJourneyGraphics: any;
    let KDJourneyGraphicsLower: any;
    let KDJourneyGraphicsUpper: any;
    let KDGameBoardAddedJourney: boolean;
    let KDMapModRefreshList: MapMod[];
    let KDJourneySlotTypes: Record<string, (Predecessor: KDJourneySlot, x: number, y: number, forceCheckpoint?: string) => KDJourneySlot>;
    function KDCreateJourneyArea(Width: number, PreviousSlot: KDJourneySlot, FinalConnection: KDJourneySlot, continueCheckpoints?: boolean): KDJourneySlot[];
    function KDCommitJourneySlots(slots: KDJourneySlot[]): void;
    function KDJourneySlotSuccessor(Slot: KDJourneySlot, xOffset: number, yOffset: number, forceCheckpoint?: string): KDJourneySlot;
    function KDCullJourneyMap(): void;
    let KDJourneyIndex: number;
    function KDRenderJourneyMap(X: number, Y: number, Width?: number, Height?: number, ScaleX?: number, ScaleY?: number, xOffset?: number, yOffset?: number, spriteSize?: number, TextOffset?: number, allowScroll?: boolean, allowChoose?: boolean): void;
    function KDGetLairName(lair: string): string;
    function KDInitJourneyMap(Level?: number): void;
    function KDDrawJourneyLine(x1: number, y1: number, x2: number, y2: number, color: number, Canvas?: any): void;
    function KDGetJourneySuccessorCheckpoint(previousCheckpoint: any, x: any): string;
    let KDUI_CurrentContainer: string;
    let KDUI_ContainerBackScreen: string;
    let KDUI_Container_LastSelected: string;
    interface KDContainer {
        name: string;
        location?: WorldCoord;
        point?: KDPoint;
        items: Record<string, item>;
        lock: string;
        type: string;
        validation?: string;
        filters?: string[];
    }
    function KDAddContainer(name: string, point?: KDPoint, location?: WorldCoord, appendCoords?: boolean, filters?: string[]): KDContainer;
    function KDGetContainerName(name: string, point?: KDPoint, location?: WorldCoord): string;
    function KDGetContainer(name: string, point?: KDPoint, location?: WorldCoord, create?: boolean, filters?: string[]): KDContainer;
    function KDGetContainerFromTile(name: string, tile: any, point?: KDPoint, location?: WorldCoord, create?: boolean, filters?: string[]): KDContainer;
    function KDDrawContainer(name: string, xOffset?: number, filters?: string[], invMsg?: string): void;
    function KDCanDrop(item: item): boolean;
    function KDValidateContainer(container: KDContainer): string;
    let KDSpecialContainers: {
        WardenChest: (container: KDContainer) => "" | "KDWardenNeedSummit";
        PlayerChest: (container: KDContainer) => string;
    };
    let KDContainerVal: {};
    let GroupHeights: {
        [_: string]: number;
    };
    let KDPoseHeights: {
        [_: string]: number;
    };
    interface GroupHeightData {
        C: Character;
        group: string;
        height: number;
    }
    function KDGetGroupHeight(C: Character, group: string): number;
    let GroupDepths: {
        [_: string]: number;
    };
    let KDPoseDepths: {
        [_: string]: number;
    };
    interface GroupDepthData {
        C: Character;
        group: string;
        depth: number;
    }
    function KDGetGroupDepth(C: Character, group: string): number;
    let KDMagicLocks: string[];
    let KDKeyedLocks: string[];
    let KDFeetRopeLink: string[];
    let KDFormFitting: string[];
    let KDHarnessLink: string[];
    let KDCorsetLink: string[];
    let KDBindable: string[];
    let KDBindableWrist: string[];
    let KDBindableMinusCuffs: string[];
    let KDDevices: string[];
    let KDTallBootsLink: string[];
    let KDTallBootsRender: string[];
    let KDElbowBind: string[];
    let KDBoxBind: string[];
    let KDWrappable: string[];
    let KDArmbinderLink: string[];
    let KDBoxbinderLink: string[];
    let KDDressLink: string[];
    let KDJacketLink: string[];
    let KDJacketRender: string[];
    let KDTransportLink: string[];
    let KDLegbinderLink: string[];
    let KDLegbinderRender: string[];
    let KDLegRopesBind: string[];
    let KDLegRopesRender: string[];
    let KDArmRopesRender: string[];
    let KDBeltsBind: string[];
    let KDBeltsRender: string[];
    let KDTapeLink: string[];
    let KDTapeRender: string[];
    let KDRubberLink: string[];
    let KDBlindfoldLink: string[];
    let KDVisorLink: string[];
    let KDWrappingLink: string[];
    let KDMaskLink: any[];
    let KDStuffingLink: string[];
    let KDBallGagLink: string[];
    let KDFlatGagLink: string[];
    let KDMuzzleGagLink: string[];
    let KDPlugGagLink: string[];
    let KDCollarLink: string[];
    let KDCollarRender: string[];
    let KDHighCollarRender: string[];
    let KDCollarModuleLink: string[];
    let KDGlovesLink: string[];
    let KDSocksLink: string[];
    let KDBeltLink: string[];
    const KinkyDungeonRestraints: restraint[];
    let KDControlHarnessCategories: {
        Cuffs: {
            activateCount: number;
            activateTags: string[];
            activateFunction: (_e: KinkyDungeonEvent, item: item, _data: any, _invItems: item[]) => void;
            updateFunction: (_e: KinkyDungeonEvent, _item: item, data: any, invItems: item[]) => void;
        };
        RemoteLink: {
            activateCount: number;
            activateTags: any[];
            activateFunction: (_e: KinkyDungeonEvent, item: item, _data: any, _invItems: item[]) => void;
            updateFunction: (_e: KinkyDungeonEvent, _item: item, _data: any, _invItems: item[]) => void;
        };
        Chastity: {
            activateCount: number;
            activateTags: string[];
            activateFunction: (_e: KinkyDungeonEvent, item: item, _data: any, _invItems: item[]) => void;
            updateFunction: (_e: KinkyDungeonEvent, _item: item, data: any, invItems: item[]) => void;
        };
    };
    let KDSFXGroups: Record<string, KDSFXGroup>;
    let KDCollectionTab: string;
    let KDCurrentFacilityTarget: string;
    let KDCurrentFacilityCollectionType: string[];
    let KDCurrentRestrainingTarget: number;
    let KDCollectionTabStatus: string;
    let KDCollectionTabStatusOptions: string[];
    let KDPromotableStatus: string[];
    let KDSummonableStatus: string[];
    let KDFacilityCollectionDataTypes: string[];
    let KDFacilityCollectionDataTypeMap: {
        Prisoners: string;
        Servants: string;
    };
    let KDCollectionTabButtons: string[];
    let KDCollectionTabButtonFilter: {
        FacilityQuick: () => number;
    };
    let KDCollFilter: string;
    type CollectionFilterItem = {
        Current: number;
        Options: string[];
        FilterCode: Record<string, (value: KDCollectionEntry) => boolean>;
    };
    let KDCollectionFilters: Record<string, CollectionFilterItem>;
    function KDDrawCollectionFilters(x: number, y: number): void;
    function KDDrawCollectionTabOptions(x: number, y: number): void;
    function KinkyDungeonDrawCollection(xOffset?: number): void;
    function KinkyDungeonDrawBondage(xOffset?: number): void;
    function KDCollectionImage(id: number): string;
    function KDAddOpinionPersistent(id: number, amount: number): void;
    function KDGetModifiedOpinionID(id: number, allowFaction?: boolean, allowSub?: boolean, allowPerk?: boolean, allowOnlyPosNegFaction?: number): number;
    function KDCapturable(enemy: entity): boolean;
    function KDCapturableType(enemy: enemy): boolean;
    function KDAddCollection(enemy: entity, type?: string, status?: string, servantclass?: string): void;
    function KDUpdatePersistentNPCFlags(delta: number): void;
    function KDUpdateCollectionFlags(delta: number): void;
    function KDGetCharacter(entity: entity): Character;
    function KDGetCharacterID(C: Character): number;
    function KDGetCharacterEntity(C: Character): entity;
    let KDRenameNPC: boolean;
    let KDToggleBigView: boolean;
    function KDDrawSelectedCollectionMember(value: KDCollectionEntry, x: number, y: number, index: number, tab?: string): void;
    function KDDrawCollectionRestrain(id: number, x: number, y: number): void;
    function KDGetVirtualCollectionEntry(id: number): KDCollectionEntry;
    function KDGetVirtualCollectionEntryEntity(enemy: entity): KDCollectionEntry;
    function KDDrawCollectionRestrainMain(id: number, x: number, y: number): void;
    function KDIsImprisonedByEnemy(id: number): boolean;
    function KDNPCUnavailable(id: number, status: string): boolean;
    let KDNPCChar: Map<number, Character>;
    let KDNPCChar_ID: Map<Character, number>;
    let KDNPCStyle: Map<any, any>;
    let KDCollectionSelected: number;
    let KDCollectionIndex: number;
    let KDCollectionGuestRows: number;
    let KDCollectionRows: number;
    let KDCollectionColumns: number;
    let KDCollectionSpacing: number;
    let KDDrawnCollectionInventory: KDCollectionEntry[];
    function KDResetCollectionUI(): void;
    function KDDrawCollectionInventory(x: number, y: number, drawCallback?: (value: KDCollectionEntry, X: number, Y: number) => void): void;
    function KDValidateEscapeGrace(value: KDCollectionEntry): boolean;
    function KDSortCollection(): void;
    function KDGenEnemyName(enemy: entity): string;
    function KDGetEnemyName(enemy: entity): string;
    let KDCollectionTabScreen: {};
    let KDCollectionTabDraw: Record<string, KDCollectionTabDrawDef>;
    function KDDrawNPCBars(value: KDCollectionEntry, x: number, y: number, width: number): number;
    function KDCanPromote(value: KDCollectionEntry): boolean;
    function KDPromote(value: KDCollectionEntry): void;
    function KDIsInSummit(): boolean;
    function KDTickAutorelease(): void;
    function KDDoCollect(entity: entity): boolean;
    function KDDefectIfPossible(entity: entity, defectTo?: string): boolean;
    interface CollectionWanderType {
        spawnRoom: string;
        spawnCondition?: (value: KDCollectionEntry, entity: entity) => entity;
        spawnConditionRemote?: (value: KDCollectionEntry) => entity;
        maintain: (value: KDCollectionEntry, entity: entity, delta: number) => void;
        onChangeFacility: (value: KDCollectionEntry, entity: entity, fromFacility: string, toFacility: string) => string;
    }
    function KDTickCollectionWanderCollectionEntry(value: KDCollectionEntry): void;
    function KDTickCollectionWanderEntity(entity: entity, delta: number): void;
    function KDChangeEntityFacilityAction(entity: entity, action: string): void;
    function KDSetServantSpawnTemplate(e: entity): void;
    function KDSetPrisonerSpawnTemplate(e: entity): void;
    let KDCollectionWanderTypes: Record<string, CollectionWanderType>;
    interface CustomCancel {
        cancel: () => void;
        condition: () => boolean;
    }
    function KDNonContextActions(mobile: boolean, textArea: boolean): boolean;
    let KDCustomCancels: {
        condition: () => boolean;
        cancel: () => boolean;
    }[];
    function KDDrawManagement(x: number, y: number, width: number): number;
    function KDGetManagementEfficiency(): number;
    function KDDrawWarden(x: number, y: number, width: number): number;
    function KDUpdateWarden(delta: number): void;
    let KDWardenChestFilters: string[];
    let KDPlayerChestFilters: string[];
    let KDSelectedRecyclerCategory: string;
    let KDSelectedRecyclerItem: string;
    let KDRecyclerCatsPerRow: number;
    let KDRecyclerItemsPerRow: number;
    let KDRecyclerCatSpacing: number;
    interface RecyclerResource {
        Yield: number;
        Rate: number;
    }
    let RecyclerResources: Record<string, RecyclerResource>;
    interface RecyclerOutputs {
        Rope: number;
        Leather: number;
        Metal: number;
        Latex: number;
        Rune: number;
    }
    function KDBaseRecycleOutputs(): RecyclerOutputs;
    function KDGetRecyclerRate(Servants: number[]): Record<string, number>;
    function KDRecycleItem(item: item, count: number, container: KDContainer): RecyclerOutputs;
    function KDChangeRecyclerInput(amount: RecyclerOutputs, mult?: number): void;
    function KDChangeRecyclerResources(amount: RecyclerOutputs, mult?: number): void;
    function KDHasRecyclerResources(amount: RecyclerOutputs, mult?: number): boolean;
    function KDHasRecyclerInput(amount: RecyclerOutputs): boolean;
    function KDRecycleString(item: item, quantity: number, container: KDContainer): string;
    function KDDrawRecycler(x: number, y: number, width: number): number;
    function KDDrawRecyclerBlueprints(cats: KDBlueprintCategory[], x: number, y: number, width: number): void;
    function KDListRecyclerCats(): KDBlueprintCategory[];
    function KDMapToRecycleOutputs(amount: Record<string, number>): RecyclerOutputs;
    function KDRecyclerResources(restraint: restraint, mult?: number, variant?: string): Record<string, number>;
    function KDAutoGenRestraintBlueprint(name: string, category: string, applyvariant: string, mult?: number, forceResourceCost?: Record<string, number>, bonusResource?: Record<string, number>, count?: number): KDBlueprint;
    function KDRecycleResourceString(allowZero?: boolean, prefix?: string, noLabel?: boolean): string;
    interface KDBlueprint {
        name: string;
        item: string;
        type: string;
        applyvariant?: string;
        recyclecost?: Record<string, number>;
        count?: number;
        recyclecategory?: string;
        prereq: () => boolean;
    }
    interface KDBlueprintCategory {
        name: string;
        prereq: () => boolean;
        items: KDBlueprint[];
    }
    let KDRecyclerCategories: Record<string, KDBlueprintCategory>;
    function KDDrawCuddleLounge(x: number, y: number, width: number): number;
    let KDCuddleLoungePersonalityMult: {
        Servant: {
            Brat: number;
            Sub: number;
            Dom: number;
        };
        Prisoner: {
            Brat: number;
            Sub: number;
            Dom: number;
        };
    };
    function KDCuddleLoungeGain(): {
        servants: number;
        prisoners: number;
        servantPoints: number;
        prisonerPoints: number;
    };
    let FacilitiesIndex: number;
    interface FacilitiesData {
        Recycler_Rope: number;
        Recycler_Latex: number;
        Recycler_Metal: number;
        Recycler_Leather: number;
        Recycler_Rune: number;
        RecyclerInput_Rope: number;
        RecyclerInput_Latex: number;
        RecyclerInput_Metal: number;
        RecyclerInput_Leather: number;
        RecyclerInput_Rune: number;
        Servants_Recycler: number[];
        Prisoners_Recycler: number[];
        Servants_CuddleLounge: number[];
        Prisoners_CuddleLounge: number[];
        Servants_Management: number[];
        Servants_Warden: number[];
        Warden_TightenedCount: number;
    }
    let FacilitiesDataBase: FacilitiesData;
    function InitFacilities(): void;
    let FacilityValidationTags: string[];
    function KDValidateAllFacilities(): void;
    function KDUpdateFacilities(delta: number): void;
    function KinkyDungeonDrawFacilities(xOffset?: number): void;
    function KDValidateServant(value: KDCollectionEntry, facility: string, type: string): boolean;
    function KDDrawFacilitiesList(xOffset: any): void;
    function KDGetServantEnemy(servant: KDCollectionEntry): enemy;
    let KDFacilityCollectionCallback: (id: number) => boolean;
    function KDDrawServantPrisonerList(facility: string, x: number, y: number, width: number, spacing?: number, setCallback?: (id: number) => boolean): number;
    interface Facility {
        draw: (x: number, y: number, wdith: number) => number;
        update: (delta: number) => boolean;
        priority: number;
        prereq: () => boolean;
        locked?: () => boolean;
        ping?: (XXQuik: number, YYQuik: number, quikCurrentCol: number, quikSpacing: number, quikSize: number) => void;
        goldCost: () => number;
        maxPrisoners: () => number;
        maxServants: () => number;
        events?: KinkyDungeonEvent[];
        defaultData: Record<string, any>;
        servantPrisonerCallback?: (number: any) => boolean;
    }
    let KDFacilityTypes: Record<string, Facility>;
    let KDNPCBindingSelectedSlot: NPCBindingSubgroup;
    let KDNPCBindingSelectedRow: NPCBindingGroup;
    let KDSelectedGenericRestraintType: string;
    let KDSelectedGenericBindItem: string;
    interface NPCRestraint extends Named {
        name: string;
        inventoryVariant?: string;
        events?: KinkyDungeonEvent[];
        powerbonus?: number;
        lock: string;
        id: number;
        faction?: string;
        conjured?: boolean;
        flags?: Record<string, number>;
    }
    function KDNPCRestraintSlotOrder(): string[];
    function KDDrawNPCRestrain(npcID: number, restraints: Record<string, NPCRestraint>, x: number, y: number): void;
    let KDNPCBindingPalette: boolean;
    let KDNPCBindingGeneric: boolean;
    let KDDefaultNPCBindPalette: string;
    function KDGetNPCRestraints(id: number): Record<string, NPCRestraint>;
    function KDSetNPCRestraints(id: number, restraints: Record<string, NPCRestraint>): void;
    function KDSetNPCRestraint(id: number, slot: string, restraint: NPCRestraint): item;
    function KDSetBindingSlot(sgroup: NPCBindingSubgroup, row: NPCBindingGroup): boolean;
    function KDNPCRestraintSize(restraint: restraint, sgroup: NPCBindingSubgroup, row: NPCBindingGroup): number;
    function KDGetRestraintsForCharacter(char: any): (item | NPCRestraint)[];
    function KDGetRestraintsForEntity(entity: entity): (item | NPCRestraint)[];
    function KDGetRestraintsForID(id: number): (item | NPCRestraint)[];
    function KDNPCRestraintValidLayers(restraint: restraint, sgroup: NPCBindingSubgroup, row: NPCBindingGroup, restraints?: Record<string, NPCRestraint>, allowSameID?: number, power?: number): NPCBindingSubgroup[];
    function KDRowItemIsValid(restraint: restraint, sgroup: NPCBindingSubgroup, row: NPCBindingGroup, restraints: Record<string, NPCRestraint>, treatAsEmpty?: boolean, power?: number): boolean;
    function KDGetEncaseGroupRow(id: any): NPCBindingGroup;
    function KDGetEncaseGroupSlot(id: string): NPCBindingSubgroup;
    function KDNPCRefreshBondage(id: number, player: number, force?: boolean, allowConjured?: boolean, container?: Record<string, item>): void;
    function KDNPCRestraintTieUp(id: number, restraint: NPCRestraint, mult?: number): void;
    function KDCanEquipItemOnNPC(r: restraint, id: number, willing: boolean): string;
    function KDFreeNPCRestraints(id: number, player: number): void;
    function KDInputSetNPCRestraint(data: any, container?: Record<string, item>): boolean;
    function KDReturnNPCItem(item: item, container?: Record<string, item>): void;
    function KDGetRestraintBondageStats(item: Named, target: entity): KDBondageStats;
    function KDGetExpectedBondageAmount(id: number, target: entity, allowConjured?: boolean, includeUnlocked?: boolean): Record<string, number>;
    function KDGetExpectedBondageAmountTotal(id: number, target: entity, allowConjured?: boolean, includeUnlocked?: boolean): number;
    function KDGetNPCStrugglePoints(id: number): Record<string, number>;
    function KDGetNPCEscapableRestraints(id: number, target: entity, bypass: boolean, helper: entity): {
        slot: string;
        inv: NPCRestraint;
        points: number;
        target: number;
    }[];
    function KDNPCStruggleTick(id: number, delta: number): {
        slot: string;
        inv: NPCRestraint;
        points: number;
        target: number;
    };
    function KDNPCDoStruggle(id: number, slot: string, restraint: NPCRestraint, chance: number): string;
    function KDWantsToEscape(value: KDCollectionEntry): boolean;
    function KDIsOKWithRestraining(value: KDCollectionEntry): boolean;
    function KDCollectionNPCEscapeTicks(ticks?: number): void;
    function KDRunNPCEscapeTick(id: number, ticks: number): void;
    function KDNPCStruggleThreshMult(enemy: entity): number;
    function KDNPCStruggleThreshMultType(enemy: enemy): number;
    function KDTriggerNPCEscape(maxNPC?: number): number;
    function KDNPCEscape(entity: entity): void;
    let KDGenericMatsPerRow: number;
    let KDGenericMatsPerRowShowAll: number;
    let KDShowAllGenericCategories: boolean;
    let KDGenericBindsPerRow: number;
    let KDGenericBindSpacing: number;
    interface KDDrawGenericRestrainCategoriesData {
        allSlots: boolean;
        showCategories: boolean;
        cats: RestraintGenericType[];
        selectedcat: RestraintGenericType;
        index: number;
        iin: number;
        x: number;
        y: number;
        secondXX: number;
        XX: number;
        YY: number;
        categoryItem: item;
        highlightedItem: string;
        colCounter: number;
        matsPerRow: number;
    }
    function KDDrawGenericRestrainCategories(data: KDDrawGenericRestrainCategoriesData, slot: NPCBindingSubgroup): void;
    function KDDrawGenericNPCRestrainingUI(cats: RestraintGenericType[], x: number, y: number, currentItem: NPCRestraint, slot: NPCBindingSubgroup, id: number, callback: (currentItem: NPCRestraint, restraint: restraint, slot: NPCBindingSubgroup, item: item, count: number, itemtype: RestraintGenericTypeSlot) => void, categoryItem: item, showCategories: boolean, showOtherSlots: boolean, matsPerRow: number, bindsPerRow: number, toff?: number): void;
    function KDDrawGenericCharacterRestrainingUI(cats: RestraintGenericType[], x: number, y: number, currentItem: NPCRestraint, slot: NPCBindingSubgroup, id: number, callback: (currentItem: NPCRestraint, restraint: restraint, slot: NPCBindingSubgroup, item: item, count: number, itemtype: RestraintGenericTypeSlot) => void, categoryItem: item, showCategories: boolean, showOtherSlots: boolean, matsPerRow: number, bindsPerRow: number, toff?: number, callbackPlayer?: (currentItem: item, restraint: restraint, item: item, count: number) => void, canAddcallback?: (restraint: restraint) => boolean): void;
    interface canNPCRemoveData {
        restraint: NPCRestraint;
        slot: string;
        canRemove: boolean;
        canRemovePower: number;
        id: number;
        entity: entity;
        encased: boolean;
        helper: entity;
    }
    function KDCanNPCRemoveItem(id: number, restraint: NPCRestraint, slot: string, bypass: boolean, helper?: entity, entity?: entity): boolean;
    let KDAutoBindRestraints: Record<string, NPCRestraint>;
    let KDAutoBindRestraintsName: string;
    let KDCollQuickFacSpacing: number;
    let KDCollQuickFacSize: number;
    let KDCollectionReleaseSelection: Record<string, boolean>;
    function KDCanRelease(id: number): boolean;
    function KDCanRemoveGuest(id: number): boolean;
    function KDCanRansom(id: number): boolean;
    function KDRansomValue(id: number): number;
    function KDIsInPlayerBase(id: number): boolean;
    function KDReleasePenalty(id: number, player: number): void;
    function KDReleasePenaltyEntity(entity: entity, player: number): void;
    function KDReleaseNPC(id: number, player: number): void;
    interface NPCBindingGroup {
        id: string;
        encaseGroup: NPCBindingSubgroup;
        layers: NPCBindingSubgroup[];
    }
    interface NPCBindingSubgroup {
        id: string;
        allowedTags: string[];
        allowedGroups: string[];
        encasedBy: string[];
        requirePerk?: string;
        noPerk?: string;
    }
    let NPCBindingRestraintSize: {
        Heels: number;
        Straitjackets: number;
        PlugGags: number;
        Yokes: number;
        Fiddles: number;
        Spreaderbars: number;
        Petsuits: number;
    };
    let NPCBindingMouthSlots: string[];
    let NPCBindingNeckSlots: string[];
    interface KDBondageStats {
        level: number;
        type: string;
        mult: number;
        amount: number;
        conditions?: string[];
        stayconditions?: string[];
    }
    let NPCBindingGroups: NPCBindingGroup[];
    let KDBondageConditions: Record<string, (r: restraint, id: number, willing: boolean) => boolean>;
    let KDQuickBindConditions: Record<string, (target: entity, player: entity, restraint: restraint, item: item) => boolean>;
    interface RestraintGenericType {
        raw?: string;
        consumableRaw?: string;
        items: RestraintGenericTypeSlot[];
    }
    interface RestraintGenericTypeSlot {
        count: number;
        restraint: string;
        icon?: string;
        variant?: string;
        events?: KinkyDungeonEvent[];
        powerbonus?: number;
        inventoryVariant?: string;
    }
    let KDRestraintGenericTypes: Record<string, RestraintGenericType>;
    let KDGenericRestraintRawCache: Record<string, {
        raw: string;
        count: number;
    }>;
    let KDGenericRestraintRawOriginalCache: Record<string, {
        name: string;
        count: number;
    }[]>;
    let KDGenericRestraintRawInfo: Record<string, string>;
    function KDRefreshRawCache(): void;
    let KDModsLoaded: boolean;
    let KDMods: Record<string, File>;
    let KDModInfo: Record<string, MODJSON>;
    let KDModIndex: number;
    let KDModCount: number;
    let KDModSpacing: number;
    let KDGetMods: boolean;
    let KDOffline: boolean;
    let KDModCompat: {
        "KinkyDungeonHiddenFactions.push(": string;
        "KDSetNPCLocation(": string;
        "KinkyDungeonChangeDesire(": string;
        "KinkyDungeonChangeCharge(": string;
        "KinkyDungeonChangeWill(": string;
        "KinkyDungeonChangeStamina(": string;
        "KinkyDungeonChangeMana(": string;
        "KDChangeBalance(": string;
        "KinkyDungeonChangeDistraction(": string;
        "KinkyDungeonCanPickStat(": string;
    };
    function CharacterLoadCanvas(): void;
    let KDModToggleTab: string;
    let KDModListPage: number;
    let KDModPage: number;
    let KDModSettings: {};
    let KDModConfigs: {};
    let KDModFileCount: number;
    interface MODJSON {
        modname: string;
        moddesc: string;
        author: string;
        modbuild: string;
        gamemajor: number;
        gameminor: number;
        gamepatch_min: number;
        gamepatch_max: number;
        priority: number;
        dependencies?: Record<string, number>;
        optional?: Record<string, string>;
        incompatibilities?: Record<string, string>;
        loadbefore?: string[];
        loadafter?: string[];
        fileorder?: string[];
    }
    function KDLoadModJSON(json: string): MODJSON;
    function KDGetModsLoad(execute: any): Promise<void>;
    function KDDrawMods(): void;
    function getFileInput(callback?: any, ...callbackArgs: any[]): void;
    function KDLoadMod(files: any[]): Promise<void>;
    let KDExecuted: boolean;
    let KDLoading: boolean;
    function KDExecuteModsAndStart(): Promise<void>;
    function KDUpdateModInfo(): Promise<void>;
    let KDModLoadOrder: {
        mod: File;
        name: string;
        fileorder: string[];
    }[];
    function KDExecuteMods(): Promise<void>;
    function KDDrawModConfigs(): void;
    function KDLoadModSettings(): void;
    const model: {
        getEntries(file: any, options: any): any;
        getURL(entry: any, options: any): Promise<string>;
        getEntryFile: (entry: any, creationMethod: any, onend: any, onprogress: any) => void;
    };
    const OGVCompat: any;
    const OGVPlayer: any;
    const PIXIWidth = 2000;
    const PIXIHeight = 1000;
    let isSafari: boolean;
    let OGVSupported: boolean;
    let resolution: number;
    var PIXIapp: any;
    let ticker: any;
    let ContextLostAlready: boolean;
    let ContextLostFixedAlready: boolean;
    let TimerRunInterval: number;
    let TimerLastTime: number;
    let CurrentTime: number;
    let TimerLastCycleCall: number;
    function MainRun(Timestamp: number): void;
    function KeyDown(event: KeyboardEvent): void;
    function Click(event: MouseEvent): void;
    function TouchStart(event: TouchEvent): void;
    function TouchEnd(event: TouchEvent): void;
    function TouchMove(touch: Touch): void;
    function MouseMove(event: MouseEvent): void;
    function LoseFocus(event: MouseEvent): void;
    let erasefragment: string;
    let erasevertex: string;
    let occlusionfragment: string;
    let occlusionvertex: string;
    let displacefragment: string;
    let displacevertex: string;
    class EraseFilter extends Filter {
        maskSprite: ISpriteMaskTarget;
        maskMatrix: PIXIMatrix;
        constructor(sprite: ISpriteMaskTarget);
        apply(filterManager: PIXIFilterSystem, input: PIXIRenderTexture, output: PIXIRenderTexture, clearMode: PIXICLEAR_MODES): void;
        get map(): PIXITexture;
        set map(value: PIXITexture);
    }
    class DisplaceFilter extends Filter {
        maskSprite: ISpriteMaskTarget;
        maskMatrix: PIXIMatrix;
        scale: PIXIPoint;
        constructor(sprite: ISpriteMaskTarget, scale?: number);
        apply(filterManager: PIXIFilterSystem, input: PIXIRenderTexture, output: PIXIRenderTexture, clearMode: PIXICLEAR_MODES): void;
        get map(): PIXITexture;
        set map(value: PIXITexture);
    }
    class OcclusionFilter extends Filter {
        maskSprite: ISpriteMaskTarget;
        maskMatrix: PIXIMatrix;
        scale: PIXIPoint;
        constructor(sprite: ISpriteMaskTarget, scale?: number);
        apply(filterManager: PIXIFilterSystem, input: PIXIRenderTexture, output: PIXIRenderTexture, clearMode: PIXICLEAR_MODES): void;
        get map(): PIXITexture;
        set map(value: PIXITexture);
    }
    let KDFontName: string;
    let KDBaseFonts: (string | {
        alias: string;
        src: string;
        mono: boolean;
        width: number;
    })[][];
    let KDFonts: Map<any, any>;
    let KDFontsAlias: Map<any, any>;
    let KDSelectedFont: string;
    let KDSelectedFontListIndex: number;
    let KDSelectedFontList: any[];
    let KDButtonFont: string;
    let KDButtonFontListIndex: number;
    let KDButtonFontList: any[];
    let KDOptimizeDisplacementMapInfo: Record<string, {
        xPad: number;
        yPad: number;
    }>;
    let DisplacementMaps: any[];
    let DisplacementScale: number;
    let displacementList: string[];
    let linearList: string[];
    let nearestList: string[];
    let CurrentLoading: string;
    let lastProgress: number;
    function incrementProgress(amount: any): (progress: any) => void;
    let buildSuff: string;
    function LoadTextureAtlas(list: any, scale_mode: any, preload?: boolean): Promise<void>;
    function PreloadDisplacement(list: any): Promise<void>;
    function load(): Promise<void>;
    function ToNamedMap<N extends Namable>(Named: N[]): {
        [_: string]: N;
    };
    function ToMap(Array: string[], ...Extra: string[]): {
        [_: string]: boolean;
    };
    function ToMapSubtract(Array: string[], Subtract: string[], ...Extra: string[]): {
        [_: string]: boolean;
    };
    function ToMapDefault(Array: string[], Default?: string): {
        [_: string]: string;
    };
    function ToMapDupe(Array: string[], ExtraMap?: Record<string, string>): {
        [_: string]: string;
    };
    function GenPlaceholderModelNames(): string;
    let LAYERS_BASE: string[];
    interface metaLayerBound {
        id: string;
        start: string;
        end: string;
    }
    let metaLayerBoundaries: metaLayerBound[];
    let LayerGroups: {
        Breastplate: {
            [_: string]: boolean;
        };
        ChestBinding: {
            [_: string]: boolean;
        };
        TopBinding: {
            [_: string]: boolean;
        };
        CrotchRope: {
            [_: string]: boolean;
        };
        ButtSleeves: {
            [_: string]: boolean;
        };
        NeckCorsetOverStraps: {
            [_: string]: boolean;
        };
        BustierPoses: {
            [_: string]: boolean;
        };
        BustierPoses2: {
            [_: string]: boolean;
        };
        BustSize: {
            [_: string]: boolean;
        };
        SlimeLegs: {
            [_: string]: boolean;
        };
        SlimeFeet: {
            [_: string]: boolean;
        };
        Shoes: {
            [_: string]: boolean;
        };
        BelowShoes: {
            [_: string]: boolean;
        };
        SlimeAnkles: {
            [_: string]: boolean;
        };
        SlimeTorsoLower: {
            [_: string]: boolean;
        };
        Petsuit: {
            [_: string]: boolean;
        };
        Legbinder: {
            [_: string]: boolean;
        };
        SlimeThighs: {
            [_: string]: boolean;
        };
        Boots: {
            [_: string]: boolean;
        };
        Heels: {
            [_: string]: boolean;
        };
        BalletHeels: {
            [_: string]: boolean;
        };
        BalletHeelsCuffs: {
            [_: string]: boolean;
        };
        HeelRight: {
            [_: string]: boolean;
        };
        BalletHeelRight: {
            [_: string]: boolean;
        };
        Arms: {
            [_: string]: boolean;
        };
        ArmsAll: {
            [_: string]: boolean;
        };
        ArmsAllAndHarness: {
            [_: string]: boolean;
        };
        Rope1: {
            [_: string]: boolean;
        };
        RopeTorso: {
            [_: string]: boolean;
        };
        CorsetTorso: {
            [_: string]: boolean;
        };
        TightChastityBelt: {
            [_: string]: boolean;
        };
        PetsuitArms: {
            [_: string]: boolean;
        };
        RopeFore: {
            [_: string]: boolean;
        };
        RopeThighs: {
            [_: string]: boolean;
        };
        RopeCalf: {
            [_: string]: boolean;
        };
        Stockings: {
            [_: string]: boolean;
        };
        StockingLeft: {
            [_: string]: boolean;
        };
        StockingRight: {
            [_: string]: boolean;
        };
        ShoeLeft: {
            [_: string]: boolean;
        };
        ShoeRight: {
            [_: string]: boolean;
        };
        ToeTie: {
            [_: string]: boolean;
        };
        Ribbon1: {
            [_: string]: boolean;
        };
        RibbonTorso: {
            [_: string]: boolean;
        };
        RibbonFore: {
            [_: string]: boolean;
        };
        CorsetBra: {
            [_: string]: boolean;
        };
        ShirtCutoffBra: {
            [_: string]: boolean;
        };
        MaidArmPoofRight: {
            [_: string]: boolean;
        };
        RibbonThighs: {
            [_: string]: boolean;
        };
        RibbonCalf: {
            [_: string]: boolean;
        };
        RibbonToeTie: {
            [_: string]: boolean;
        };
        LegCuffs: {
            [_: string]: boolean;
        };
        Yoke: {
            [_: string]: boolean;
        };
        Fiddle: {
            [_: string]: boolean;
        };
        Cuffs: {
            [_: string]: boolean;
        };
        Mitts: {
            [_: string]: boolean;
        };
        MittL: {
            [_: string]: boolean;
        };
        MittR: {
            [_: string]: boolean;
        };
        RightHand: {
            [_: string]: boolean;
        };
        HairHelmet: {
            [_: string]: boolean;
        };
        HairBlockBF: {
            Blindfold: boolean;
        };
        EarsHelmet: {
            [_: string]: boolean;
        };
        Xray: {
            [_: string]: boolean;
        };
        WrappingLegsOver: {
            WrappingLegsOver2: boolean;
            LegbinderLegsOver2: boolean;
            WrappingLegsOver: boolean;
            LegbinderLegsOver: boolean;
            WrappingLegs: boolean;
            WrappingLegs2: boolean;
        };
        BindWristLeft: {
            BindWristLeft: boolean;
            BindForeWristLeft: boolean;
            BindCrossWristLeft: boolean;
        };
        BindWristRight: {
            BindWristRight: boolean;
            BindForeWristRight: boolean;
            BindCrossWristRight: boolean;
        };
        XrayFace: {
            [_: string]: boolean;
        };
        XrayPanties: {
            [_: string]: boolean;
        };
        XrayBra: {
            [_: string]: boolean;
        };
        Bubble: {
            [_: string]: boolean;
        };
        All: {
            [_: string]: boolean;
        };
    };
    let LayerProperties: {
        ShoeLeftOver: {
            Parent: string;
        };
        ShoeLeftUnder: {
            Parent: string;
        };
        ShoeRightOver: {
            Parent: string;
        };
        ShoeRightUnder: {
            Parent: string;
        };
        FurnitureFront: {
            Parent: string;
        };
        FurnitureBack: {
            Parent: string;
        };
        Glasses: {
            Parent: string;
        };
        Eyes: {
            Parent: string;
        };
        Hair: {
            Parent: string;
        };
        HairFront: {
            Parent: string;
        };
        HairOver: {
            Parent: string;
        };
        HairMiddle: {
            Parent: string;
        };
        HairBack: {
            Parent: string;
        };
        HairPonytail: {
            Parent: string;
        };
        Mouth: {
            Parent: string;
        };
        Blush: {
            Parent: string;
        };
        Fear: {
            Parent: string;
        };
        Brows: {
            Parent: string;
        };
        Ears: {
            Parent: string;
        };
        Nose: {
            Parent: string;
        };
        InflatableHead: {
            Parent: string;
        };
        Hat: {
            Parent: string;
        };
        Hood: {
            Parent: string;
        };
        HeadbandDeco: {
            Parent: string;
        };
        Headband: {
            Parent: string;
        };
        Mask: {
            Parent: string;
        };
        MaskOver: {
            Parent: string;
        };
        MouthProp: {
            Parent: string;
        };
        Goggles: {
            Parent: string;
        };
        BlindfoldWrap: {
            Parent: string;
        };
        Blindfold: {
            Parent: string;
        };
        GagOver: {
            Parent: string;
        };
        GagMuzzleStraps: {
            Parent: string;
        };
        GagMuzzle: {
            Parent: string;
        };
        GagFlatStraps: {
            Parent: string;
        };
        GagFlat: {
            Parent: string;
        };
        GagStraps: {
            Parent: string;
        };
        Gag: {
            Parent: string;
        };
        GagUnder: {
            Parent: string;
        };
        Circlet: {
            Parent: string;
        };
        CircletUnder: {
            Parent: string;
        };
        HatBack: {
            Parent: string;
        };
        AnimalEars: {
            Parent: string;
        };
        AnimalEarsFront: {
            Parent: string;
        };
        Tail: {
            Parent: string;
        };
    };
    let Hardpoints: Record<string, Hardpoint>;
    let LAYER_INCREMENT: number;
    let MODELHEIGHT: number;
    let MODELWIDTH: number;
    let MODEL_SCALE: number;
    let MODEL_XOFFSET: number;
    let ARMPOSES: string[];
    let WRISTHIDELEFT: string[];
    let WRISTHIDERIGHT: string[];
    let SHOULDERPOSES: string[];
    let HIDEARMPOSES: any[];
    let FOREARMPOSES: string[];
    let CROSSARMPOSES: string[];
    let HANDRIGHTPOSES: string[];
    let HANDLEFTPOSES: string[];
    let FOREHANDRIGHTPOSES: string[];
    let FOREHANDLEFTPOSES: string[];
    let LEGPOSES: string[];
    let ANKLERIGHTPOSES: string[];
    let ANKLELEFTPOSES: string[];
    let FOOTRIGHTPOSES: string[];
    let FOOTLEFTPOSES: string[];
    let CALFRIGHTPOSES: string[];
    let CALFLEFTPOSES: string[];
    let KNEELPOSES: string[];
    let HOGTIEPOSES: string[];
    let STANDPOSES: string[];
    let CLOSEDPOSES: string[];
    let SPREADPOSES: string[];
    let SPREADCLOSEDPOSES: string[];
    let EYETYPES: string[];
    let EYEPOSES: string[];
    let EYE2POSES: string[];
    let BROWTYPES: string[];
    let BROWPOSES: string[];
    let BROW2POSES: string[];
    let MOUTHPOSES: string[];
    let BLUSHPOSES: string[];
    let FEARPOSES: string[];
    let STANDARD_DEFAULTS: string[];
    let PoseProperties: {
        [_: string]: PoseProperty;
    };
    function ModelGetMaxPose(Poses: {
        [_: string]: boolean;
    }, CheckVar: string, FilterVar?: string | null): string;
    function ModelGetPoseOffsets(Poses: {
        [_: string]: boolean;
    }, Flip: boolean): {
        X_Offset: number;
        Y_Offset: number;
    };
    function ModelGetPoseRotation(Poses: {
        [_: string]: boolean;
    }): {
        rotation: number;
        X_Anchor: number;
        Y_Anchor: number;
    };
    function ModelGetPoseMods(Poses: {
        [_: string]: boolean;
    }): {
        [_: string]: PoseMod[];
    };
    function CheckPoseOrTags(C: Character, tag: string, tags?: Map<string, boolean>, tagsOnly?: boolean): boolean;
    function KDGetAvailablePosesLegs(C: Character, tags?: Map<string, boolean>, tagsOnly?: boolean): string[];
    function KDGetAvailablePosesArms(C: Character, tags?: Map<string, boolean>): string[];
    function RefreshTempPoses(Character: Character, Restraints: boolean, Buffs?: boolean): void;
    function KDRefreshPoseOptions(Character: Character): void;
    function KDRefreshPoseOptionsMC(MC: ModelContainer): void;
    let KDArmorPoses: string[];
    let SHOWMESHPOINTS: boolean;
    let StruggleAnimation: boolean;
    let RenderCharacterQueue: Map<any, any>;
    let RenderCharacterLock: Map<any, any>;
    let KDFilterCacheToDestroy: PIXIFilter[];
    let KDFilterDrawn: Map<PIXIFilter, boolean>;
    let KDRenderTexToDestroy: PIXITexture[];
    let KDMeshToDestroy: PIXIMesh[];
    let KDSpritesToCull: PIXISprite[];
    let KDCulling: boolean;
    function InitLayers(layers: string[]): {
        [_: string]: number;
    };
    function InitMetaLayers(bounds: metaLayerBound[]): {
        forward: Record<string, string[]>;
        reverse: Record<string, string>;
        order: Record<string, number>;
    };
    let ModelLayers: {
        [_: string]: number;
    };
    let metaLayersData: {
        forward: Record<string, string[]>;
        reverse: Record<string, string>;
        order: Record<string, number>;
    };
    let metaLayerForward: Record<string, string[]>;
    let metaLayerReverse: Record<string, string>;
    let metaLayerOrder: Record<string, number>;
    let ModelDefs: {
        [_: string]: Model;
    };
    function AddModel(Model: Model, Strings?: Record<string, string>): void;
    let KDCurrentModels: Map<Character, ModelContainer>;
    interface ContainerInfo {
        readonly SpriteList: Map<string, any>;
        readonly SpritesDrawn: Map<string, any>;
        readonly Container: PIXIContainer;
        readonly Mesh: PIXIMesh;
        readonly RenderTexture: PIXIRenderTexture;
        readonly Matrix: PIXIArray;
        Zoom: number;
    }
    class ModelContainer {
        HighestPriority: {
            [_: string]: number;
        };
        HiddenLayers: {
            [_: string]: number;
        };
        XRayFilters: string[];
        Character: Character;
        Models: Map<string, Model>;
        Containers: Map<string, ContainerInfo>;
        ContainersDrawn: Map<string, ContainerInfo>;
        Poses: Record<string, boolean>;
        TempPoses: Record<string, boolean>;
        readonly Update: Set<string>;
        readonly ForceUpdate: Set<string>;
        readonly Refresh: Set<string>;
        readonly Mods: Map<string, PoseMod[]>;
        readonly EndMods: Map<string, PoseMod[]>;
        constructor(Character: Character, Models: Map<string, Model>, Containers: Map<string, ContainerInfo>, ContainersDrawn: Map<string, ContainerInfo>, Poses: Record<string, boolean>);
        addModel(Model: Model, Filters?: Record<string, LayerFilter>, LockType?: string, Properties?: Record<string, LayerPropertiesType>, factionFilters?: Record<string, FactionFilterDef>): void;
        updateModel(Name: string): void;
        removeModel(Model: string): void;
    }
    function ToLayerMap(Layers: ModelLayer[]): {
        [_: string]: ModelLayer;
    };
    function GetModelLayers(ModelName: string, PrependString?: string, AppendString?: string, InheritColor?: string, PriBonus?: number, layerSwap?: string, Folder?: string, noTieToLayer?: boolean): ModelLayer[];
    function GetModelLayersNoOverride(ModelName: string, PrependString?: string, AppendString?: string, InheritColor?: string, PriBonus?: number, layerSwap?: string, Folder?: string): ModelLayer[];
    function GetModelWithExtraLayers(NewModel: string, BaseModel: string, Layers: ModelLayer[], Parent?: string, TopLevel?: boolean, ExtraProps?: object): Model;
    function GetModelRestraintVersion(BaseModel: string, Parent: boolean, extraAddPoses?: string[], removeRemovePoses?: string[]): Model;
    function GetModelFashionVersion(BaseModel: string, Parent: boolean, removeOptionSwap?: boolean): Model;
    function GetOverCorset(BaseModel: string): Model;
    function DisposeCharacter(C: Character, resort?: boolean, deleteSpecial?: boolean): void;
    function DisposeEntity(id: number, resort?: boolean, deleteSpecial?: boolean, deletePersistent?: boolean): void;
    function DrawCharacter(C: Character, X: number, Y: number, Zoom: number, IsHeightResizeAllowed?: boolean, DrawCanvas?: any, Blend?: any, StartMods?: PoseMod[], zIndex?: number, flip?: boolean, extraPoses?: string[], containerID?: string, EndMods?: PoseMod[]): void;
    let DrawModel: typeof DrawCharacter;
    function LayerIsHidden(MC: ModelContainer, l: ModelLayer, m: Model, Mods: any): boolean;
    function LayerLayer(MC: ModelContainer, l: ModelLayer, m: Model, Mods?: any): string;
    function LayerPri(MC: ModelContainer, l: ModelLayer, m: Model, Mods?: any): number;
    function KDLayerPropName(l: ModelLayer, Poses: Record<string, boolean>, props: Record<string, LayerPropertiesType>): string;
    function DrawCharacterModels(containerID: string, MC: ModelContainer, X: any, Y: any, Zoom: any, StartMods: PoseMod[], ContainerContainer: any, refreshfilters: boolean, flip: boolean, EndMods: PoseMod[]): boolean;
    function FilterHash(filter: any): string;
    const KDAdjustmentFilterCache: Map<string, PIXIFilter[]>;
    function ModelDrawLayer(MC: ModelContainer, Model: Model, Layer: ModelLayer, Poses: Record<string, boolean>): boolean;
    function ModelLayerHidden(drawLayers: {
        [_: string]: boolean;
    }, MC: ModelContainer, Model: Model, Layer: ModelLayer, Poses: {
        [_: string]: boolean;
    }): boolean;
    function ModelLayerString(Model: Model, Layer: ModelLayer, Poses: {
        [_: string]: boolean;
    }): string;
    function ModelLayerStringCustom(Model: Model, Layer: ModelLayer, Poses: {
        [_: string]: boolean;
    }, Sprite: string, Path?: string, useModelFolder?: boolean, forceInvariant?: boolean, forceMorph?: Record<string, string>, noAppend?: boolean): string;
    function LayerSprite(Layer: ModelLayer, Poses: {
        [_: string]: boolean;
    }): string;
    function LayerSpriteCustom(Layer: ModelLayer, Poses: {
        [_: string]: boolean;
    }, Sprite: string, forceInvariant?: boolean, forceMorph?: Record<string, string>, noAppend?: boolean): string;
    function GetTrimmedAppearance(C: Character): Item[];
    function IsModelLost(C: Character, Name: string): boolean;
    function UpdateModels(C: Character, Xray?: string[], customFaction?: string): void;
    function ForceRefreshModels(C: Character): void;
    function ForceRefreshModelsAsync(C: Character, ms?: number): Promise<void>;
    function KDGetColorableLayers(Model: Model, Properties: boolean): {
        name: string;
        layer: string;
    }[];
    function KDGeneratePoseArray(ArmsPose?: string | undefined, LegsPose?: string | undefined, EyesPose?: string | undefined, BrowsPose?: string | undefined, BlushPose?: string | undefined, MouthPose?: string | undefined, Eyes2Pose?: string | undefined, Brows2Pose?: string | undefined, ExtraPose?: string | undefined, FearPose?: string | undefined): {
        [_: string]: boolean;
    };
    let PoseCheckArray: {
        Arms: string[];
        Legs: string[];
        Eyes: string[];
        Eyes2: string[];
        Brows: string[];
        Brows2: string[];
        Blush: string[];
        Mouth: string[];
        Fear: string[];
    };
    function KDGetPoseOfType(C: Character, Type: string): string;
    function GetUnnamedModels(): void;
    interface Hardpoint {
        Parent: string;
        X: number;
        Y: number;
        OffsetX?: number;
        OffsetY?: number;
        Angle: number;
    }
    function GetModelLoc(C: Character, X: number, Y: number, ZoomInit: number, hp: Hardpoint, Flip: boolean, NoMods?: boolean): {
        x: number;
        y: number;
        angle: number;
    };
    function GetModelLocInverse(C: Character, X: number, Y: number, ZoomInit: number, hp: Hardpoint, Flip: boolean): {
        x: number;
        y: number;
        angle: number;
    };
    function GetHardpointLoc(C: Character, X: number, Y: number, ZoomInit: number, Hardpoint: string, Flip: boolean): {
        x: number;
        y: number;
        angle: number;
    };
    function DrawModelProcessPoses(MC: ModelContainer, extraPoses: string[]): any[];
    function RenderModelContainer(MC: ModelContainer, C: Character, containerID: string): void;
    function KDCullModelContainerContainer(MC: ModelContainer, containerID: string): boolean;
    function adjustFilter(filter: any): any;
    class Transform {
        ox: number;
        oy: number;
        ax: number;
        ay: number;
        sx: number;
        sy: number;
        rot: number;
        constructor(ox?: number, oy?: number, ax?: number, ay?: number, sx?: number, sy?: number, rot?: number);
        get(): {
            x: number;
            y: number;
            sx: number;
            sy: number;
            rot: number;
        };
        recursiveTransform(ox: number, oy: number, ax: number, ay: number, sx: number, sy: number, rot: number): Transform;
        apply(transform: any): Transform;
    }
    function KDModelIsProtected(m: Model): boolean;
    function KDContainerClear(Container: ContainerInfo): void;
    function KDSetFilterSprite(info: {
        hash: string;
        filter: PIXIFilter;
    }, sprite: PIXISprite): void;
    let slimefilter: {
        gamma: number;
        saturation: number;
        contrast: number;
        brightness: number;
        red: number;
        green: number;
        blue: number;
        alpha: number;
    };
    let tapefilter: {
        gamma: number;
        saturation: number;
        contrast: number;
        brightness: number;
        red: number;
        green: number;
        blue: number;
        alpha: number;
    };
    let KDModelStyles: Record<string, Record<string, string[]>>;
    let KDModelFace: {
        [_: string]: KinkyDungeonDress;
    };
    let KDModelHair: {
        [_: string]: KinkyDungeonDress;
    };
    let KDModelBody: {
        [_: string]: KinkyDungeonDress;
    };
    let KDModelCosplay: {
        [_: string]: KinkyDungeonDress;
    };
    let KDModelDresses: {
        [_: string]: KinkyDungeonDress;
    };
    let KDConfirmType: string;
    let KinkyDungeonReplaceConfirm: number;
    let lastFastPaletteUpdate: number;
    let KDCanRevertFlag: boolean;
    let KDSelectedPaletteLayer: string;
    let GenericPaletteLayers: string[];
    let GenericPaletteLayerSprites: {
        Highlight: string;
        DarkNeutral: string;
        LightNeutral: string;
        Catsuit: string;
        None: string;
    };
    let ColorPickerFilterCode: Record<string, string>;
    let ColorPickerFilter: Record<string, PIXIAdjustmentFilter>;
    let KDCurrentColorFilterCode: {};
    let KDCurrentColorFilter: {};
    let KDCurrentOutfit: number;
    let KDMaxOutfits: number;
    let KDMaxOutfitsDisplay: number;
    let KDMaxOutfitsIndex: number;
    let KDOutfitInfo: any[];
    let KDOutfitStore: {};
    let KDOutfitOriginalStore: {};
    let lastFilterUpdate: number;
    let FilterUpdateInterval: number;
    let KDModelListMax: number;
    let KDModelListViewSkip: number;
    let KDShowCharacterPalette: boolean;
    let KDCurrentCharacterPalettes: Record<string, Record<string, LayerFilter>>;
    let KDModelList_Categories_index: number;
    let KDModelList_Categories_viewindex: {
        index: number;
    };
    let KDModelList_Categories: any[];
    let KDModelList_Toplevel_index: number;
    let KDModelList_Toplevel_viewindex: {
        index: number;
    };
    let KDModelList_Toplevel: any[];
    let KDModelList_Sublevel_index: number;
    let KDModelList_Sublevel_viewindex: {
        index: number;
    };
    let KDModelList_Sublevel: any[];
    let KDModelListFilter: string;
    let KDRefreshProps: boolean;
    let KDCategoryFilterSpecial: Record<string, (C: Character, m: Model, stage: number, level: number) => boolean>;
    let KDCategoryFilterSpecialSubClick: Record<string, (C: Character, en: any, index: number, name: string) => ((_bdata: any) => boolean)>;
    let KDCategoryFilterSpecialSubNoBorder: Record<string, (C: Character, en: any, index: number, name: string) => boolean>;
    let KDCategoryFilterSpecialTopClick: Record<string, (C: Character, en: any, index: number, name: string) => ((_bdata: any) => boolean)>;
    let KDCategoryFilterSpecialTopNoBorder: Record<string, (C: Character, en: any, index: number, name: string) => boolean>;
    let KDWardrobeCategories: string[];
    let KDSelectedModel: Model;
    let KDColorSliders: LayerFilter;
    let KDProps: LayerPropertiesType;
    let KDColorSliderColor: {
        red: string;
        green: string;
        blue: string;
    };
    let KDCurrentLayer: string;
    let KDCurrentLayerOrig: string;
    let KDSavedColorCount: number;
    let KDSavedColorPerRow: number;
    let KDSavedColors: any[];
    let KDWardrobe_PoseArms: string[];
    let KDWardrobe_PoseLegs: string[];
    let KDWardrobe_PoseEyes: string[];
    let KDWardrobe_PoseEyes2: string[];
    let KDWardrobe_PoseBrows: string[];
    let KDWardrobe_PoseBrows2: string[];
    let KDWardrobe_PoseMouth: string[];
    let KDWardrobe_PoseBlush: string[];
    let KDWardrobe_PoseFear: string[];
    interface NPCPoseStruct {
        CurrentPoseArms?: string;
        CurrentPoseLegs?: string;
        CurrentPoseEyes?: string;
        CurrentPoseBrows?: string;
        CurrentPoseBlush?: string;
        CurrentPoseMouth?: string;
        CurrentPoseEyes2?: string;
        CurrentPoseBrows2?: string;
        CurrentPoseFear?: string;
    }
    let KDNPCPoses: Map<Character, NPCPoseStruct>;
    let NPCDesiredPoses: Map<Character, KDExpressionPoseType>;
    function KDInitCurrentPose(blank?: boolean, C?: Character): void;
    function KDDrawSavedColors(X: number, y: number, max: number, C: Character): void;
    let KDPropsSlider: boolean;
    function KDDrawColorSliders(X: number, Y: number, C: Character, Model: Model): void;
    function KDUpdateChar(C: Character): void;
    let KDLayerIndex: number;
    function KDDrawPoseButtons(C: Character, X?: number, Y?: number, allowRemove?: boolean, dress?: boolean, updateDesired?: boolean): void;
    function KDUpdateModelList(level?: number, C?: Character): void;
    function KDChangeWardrobe(C: Character): void;
    function KDDrawModelList(X: number, C: Character): void;
    function KDCanForcePose(C: Character): boolean;
    let KDDefaultWardrobePalettes: Record<string, Record<string, LayerFilter>>;
    let KDWardrobePreviewRestraints: string;
    function KDDrawWardrobe(_screen: string, Character: Character): void;
    let KDToolsDisplayPoses: boolean;
    let KDWardrobeCallback: any;
    let KDWardrobeRevertCallback: any;
    let KDWardrobeResetCallback: any;
    function KDSaveCodeOutfit(C: Character, clothesOnly?: boolean): void;
    function KDRestoreOutfit(): void;
    function KDSaveOutfitInfo(): void;
    function KDRefreshOutfitInfo(): void;
    function hslToRgb(h: number, s: number, l: number): number[];
    function hueToRgb(p: number, q: number, t: number): number;
    function rgbToHsl(r: number, g: number, b: number): number[];
    let KDVisualBrightness: number;
    function KDLoadOutfit(files: File[]): void;
    function KDLoadOutfitDirect(files: File[], Char: Character): void;
    function KDGetCharMetadata(C: Character): KDOutfitMetadata;
    function KDDrawWardrobeToolsButtons(X: any, Y: any, C: any, Model: any): void;
    function KDWardrobeToolsDraw(C: Character): boolean;
    let KDWToolsPivotAimEnabled: boolean;
    let KDWToolsPivotAim2: boolean;
    let KDWToolsPivotAimRefresh: boolean;
    function CenterPivotToMouse(C: Character, CurrentLayer: LayerPropertiesType, Parent?: string): void;
    function KDWToolsDrawPivotPoint(C: Character, CurrentLayer: LayerPropertiesType, Zoom: number, Parent: string): void;
    let KDWToolsDraggingEnabled: boolean;
    let KDWToolsIsDraggingNow: boolean;
    let KDWToolsDraggingDelta: {
        x: number;
        y: number;
        Scroll: number;
        zIndex: number;
    };
    let KDWToolsDraggingRefresh: boolean;
    let KDWToolsDraggingScrollRefresh: boolean;
    let KDWToolsDraggingShiftKey: boolean;
    let KDWToolsDraggingCtrlKey: boolean;
    let KDWToolsDraggingLazyRefresh: number;
    function ApplyDragDisplacement(C: any, CurrentLayer: any, Parent: string): void;
    let KDWToolsDrawSettingsMenuEnabled: boolean;
    function KDWToolsDrawSettingsMenu(X: any, Y: any, C: any, Model: any, Width: any): void;
    function KDWToolsDrawOptionEntry(X: any, Y: any, Width: any, Height: any, Label: any, funcPrev: any, funcNext: any, zIndex?: any, alpha?: number): void;
    function KDGetLayerPropFields(): Record<keyof LayerPropertiesType, string>;
    function KDGetAbbreviations(context?: string): {
        Right: string;
        Left: string;
        Dress: string;
        Spread: string;
        Closed: string;
        Hogtie: string;
        Kneel: string;
        KneelClosed: string;
        Yoked: string;
        Free: string;
        Boxtie: string;
        Wristtie: string;
        Up: string;
        Crossed: string;
        Front: string;
    };
    function KDAbbreviate(str: string, context?: string): string;
    function KDDrawColorPicker(id: string, currentLayerName: string, targetFilter: LayerFilter, targetFilters: Record<string, LayerFilter>, YY: number, X?: number, width?: number, callback_reset?: () => void, callback_paste?: (parsed: LayerFilter) => void, callback_pastefield?: (parsed: LayerFilter) => void, callback_update?: (key: string) => boolean, callback_updatewheel?: (r: number, g: number, b: number) => void, callback_updateadv?: (key: string) => void, callback_textfield?: (r: number, g: number, b: number) => void, callback_palette?: (key: string, override: boolean, desaturate: boolean) => void, palette?: string, pid?: string, factionFilterDef?: FactionFilterDef, debug?: boolean): {
        YY: number;
        updated: boolean;
    };
    function KDGetPreviewRestraints(preview: string): Record<string, NPCRestraint>;
    function KDDressWardrobeChar(C: Character, forcedress?: boolean): void;
    let KDlastSelectedModel: Model;
    let KDWardrobePreviewRestraintsListI: number;
    let KDWardrobePreviewRestraintsList: Record<string, Record<string, NPCRestraint>>;
    interface EligibleRestraintEntry {
        restraint: restraint;
        applyVariant: ApplyVariant;
        lock: string;
        forceConjure: boolean;
        row: NPCBindingGroup;
        slot: NPCBindingSubgroup;
        faction?: string;
    }
    function KDGetNPCBindingSlotForItem(restraint: restraint, id: number, treatAsEmpty?: boolean, power?: number): {
        row: NPCBindingGroup;
        sgroup: NPCBindingSubgroup;
    };
    function KDGetBulletBindingTags(bindType: string, playerEffect: any, merge: boolean): string[];
    function KDGetNPCRestraintPower(restraint: NPCRestraint): number;
    function KDGetNPCEligibleRestraints_fromTags(id: number, tags: string[], options: {
        forceEffLevel?: number;
        allowedRestraints?: restraint[];
        allowedRestraintNames?: string[];
        noOverride?: boolean;
        allowVariants?: boolean;
        forceLock?: string;
        fallbackLock?: string;
        forceCurse?: string;
        forceConjure?: boolean;
        currentWill?: number;
    }): EligibleRestraintEntry[];
    let KDBindTypeTagLookup: Record<string, string[]>;
    interface PathCondition {
        query: (attemptingNPC: entity, thisNPC: entity) => boolean;
        displaceAttempt?: (power: number, thisNPC: entity) => boolean;
        doPassthrough: (attemptingNPC: entity, thisNPC: entity, mapdata: KDMapDataType) => number;
        doDisplace?: (power: number, thisNPC: entity, mapdata: KDMapDataType) => boolean;
    }
    let KDPathConditions: Record<string, PathCondition>;
    interface LeashCondition {
        check: (enemy: entity, player: entity) => boolean;
    }
    let KDLeashConditions: Record<string, LeashCondition>;
    function KDMurderShopkeeper(count: number): void;
    let KDPlayerTitlesEnabled: string | boolean;
    let KDUnlockedTitles: any;
    function PlayerTitleTick(): void;
    let KDTitleTabCurrentTitle: string;
    let KDTitleTabCurrentDesc: string;
    let KDTitleTabCurrentIcon: string;
    let KDTitleTabCurrentTitleSelected: string;
    let KDTitleTabCurrentCategory: string;
    let KDTitleTabCurrentOffset: number;
    let KDTitleTabTitlesOffset: number;
    function KinkyDungeonDrawTitles(): void;
    function KDPlayerTitlesRefreshCategories(): void;
    let KDPlayerTitles: Record<string, KDPlayerTitle>;
    let KDPlayerTitleCategories: Record<string, string[]>;

}

export { };