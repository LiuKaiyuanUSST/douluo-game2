// engine/skills.js
// 每个技能包含 baseProb（基础触发概率），实际概率根据使用者出战系别调整：
// - 主系出战时：主系技能100%，副系技能80%，其他系50%
// - 副系出战时：主系技能80%，副系技能80%，其他系50%


// 通用被动技能（不分系别，战斗开始时自动触发，不消耗SP，不占用主动技能位）
export const PASSIVE_SKILLS = [
    { id: '增力', name: '增力', type: 'passive_force', desc: '战斗开始时力量+1（可叠加）' },
    { id: '增速', name: '增速', type: 'passive_speed', desc: '战斗开始时速度+1（可叠加）' },
    { id: '增智', name: '增智', type: 'passive_intel', desc: '战斗开始时智力+1（可叠加）' }
];

export const SKILL_POOL = {
    '苍木': [
        { id: '缠绕', name: '缠绕', cost: 2, type: 'bind', target: 'enemy', baseProb: 1.0, desc: '普攻并100%附加缠绕（被缠绕者普攻无法造成伤害，持续1回合）' },
        { id: '复生', name: '复生', cost: 3, type: 'reborn', target: 'ally', baseProb: 0.5, desc: '50%为目标回复1点生命，然后100%附加复生标记（每回合结束50%回复1HP）' },
        { id: '蔓延', name: '蔓延', cost: 3, type: 'spread', target: 'self', baseProb: 1.0, desc: '100%本场攻击距离永久+2' }
    ],
    '雷霆': [
        { id: '雷神变', name: '雷神变', cost: 2, type: 'thunder_emp', target: 'enemy', baseProb: 0.5, desc: '普攻，若命中则50%概率额外攻击1个目标' },
        { id: '雷霆万钧', name: '雷霆万钧', cost: 3, type: 'thunder_mass', target: 'enemy_all', baseProb: 0.5, desc: '普攻，50%概率额外溅射2个目标（无距离限制）' },
        { id: '柔骨锁', name: '柔骨锁', cost: 2, type: 'lock', target: 'enemy', baseProb: 1.0, desc: '普攻并100%附加锁链（目标无法使用魂技2回合）' }
    ],
    '巨兽': [
        { id: '兽王', name: '兽王', cost: 2, type: 'beast_king', target: 'self', baseProb: 1.0, desc: '100%自身免疫控制（本场）' },
        { id: '肉盾', name: '肉盾', cost: 1, type: 'shield', target: 'self', baseProb: 1.0, desc: '100%为自身添加肉盾标记，每回合抵挡1点伤害（本场，不可叠加）' },

        { id: '蛮力', name: '蛮力', cost: 1, type: 'brute', target: 'enemy', baseProb: 1.0, desc: '普攻并100%额外+1伤害' }
    ],
    '蛊毒': [
        { id: '中毒', name: '中毒', cost: 2, type: 'poison', target: 'enemy', baseProb: 1.0, desc: '普攻并100%为目标附加中毒（每回合50%掉1HP，累计2次后移除）' },
        { id: '扩散', name: '扩散', cost: 2, type: 'spread_poison', target: 'random_enemy', baseProb: 1.0, desc: '普攻+对全场所有角色100%概率附加中毒标记，对己方所有中毒角色100%附加激发标记（智力+3，本场战斗）' },
        { id: '驱毒', name: '驱毒', cost: 2, type: 'cure_poison', target: 'all_ally', baseProb: 1.0, desc: '100%驱散我方所有角色中毒标记（每个角色独立结算概率）' }
    ],
    '天工': [
        { id: '治疗', name: '治疗', cost: 2, type: 'heal', target: 'ally', baseProb: 0.5, desc: '50%回复2点HP' },
        { id: '一曰力', name: '一曰力', cost: 3, type: 'power_up', target: 'ally', baseProb: 0.5, desc: '50%附加巨力（本场力量+2）' },
        { id: '二曰速', name: '二曰速', cost: 3, type: 'speed_up', target: 'ally', baseProb: 0.5, desc: '50%附加极速（本场速度+2）' }
    ],
    '沧澜': [
        { id: '痊愈', name: '痊愈', cost: 3, type: 'heal_all', target: 'all_ally', baseProb: 0.5, desc: '50%概率为每个存活队友回复1HP' },
        { id: '海渊迟滞', name: '海渊迟滞', cost: 2, type: 'ocean_delay', target: 'enemy', baseProb: 1.0, desc: '普攻并以100%概率为攻击范围内2名敌人添加迟滞标记（速度-2）' },
        { id: '净化', name: '净化', cost: 3, type: 'cleanse', target: 'all_ally', baseProb: 1.0, desc: '100%驱除本方所有负面状态（缠绕/锁链/中毒/燃烧/烟雾/迟滞）' }
    ],
    '烈焰': [
        { id: '爆裂', name: '爆裂', cost: 2, type: 'burn_mass', target: 'random_enemy', baseProb: 0.5, desc: '普攻攻击1名敌人，然后100%为随机2名其他敌人附加燃烧标记' },
        { id: '灼烧', name: '灼烧', cost: 1, type: 'burn', target: 'enemy', baseProb: 1.0, desc: '普攻并100%为目标附加燃烧（每回合50%掉1HP，累计2次后移除）' },
        { id: '浓烟弥漫', name: '浓烟弥漫', cost: 2, type: 'smoke', target: 'enemy', baseProb: 1.0, desc: '普攻并以100%概率为攻击范围内随机2名敌人附加烟雾（智力-2）' }
    ]
};

/**
 * 计算技能的实际触发概率
 * 规则：武魂有主系A、副系B
 *   - 以A出战时：A技能100%，B技能80%，其他系50%
 *   - 以B出战时：A技能80%，B技能80%，其他系50%
 * @param {string} skillAffinity - 技能所属系别
 * @param {string} chosenAffinity - 角色当前出战系别
 * @param {string} mainAffinity - 武魂主系
 * @param {string} subAffinity - 武魂副系
 * @param {number} baseProb - 技能基础概率
 * @returns {number} 实际概率
 */
// ===== 修改点：主/副系（非出战）基础成功率从50%提升至80% =====
// 原逻辑：主系出战时副系50%，副系出战时主系50%
// 新逻辑：主系出战时副系80%，副系出战时主系80%
// 即：只要技能属于主系或副系（无论是否出战），基础成功率均为80%
export function getActualProb(skillAffinity, chosenAffinity, mainAffinity, subAffinity, baseProb) {
    if (skillAffinity === chosenAffinity) {
        // 出战系 = 主系 → 100%；出战系 = 副系 → 80%
        return chosenAffinity === mainAffinity ? baseProb : baseProb * 0.8;
    } else if (skillAffinity === mainAffinity) {
        // 主系（非出战）：主系出战时副系80%，副系出战时主系80%
        return baseProb * 0.8;
    } else if (skillAffinity === subAffinity) {
        // 副系（非出战）：主系出战时副系80%，副系出战时副系80%
        return baseProb * 0.8;
    } else {
        // 其他系：50%
        return baseProb * 0.5;
    }
}



export function randomSkillFromAffinity(affinity) {
    const pool = SKILL_POOL[affinity];
    if (!pool || pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)].id;
}

export function getSkillById(skillId) {
    // 先查被动技能
    const passive = PASSIVE_SKILLS.find(s => s.id === skillId);
    if (passive) return { ...passive, affinity: '通用' };
    // 再查各系主动技能
    for (const affinity in SKILL_POOL) {
        const skill = SKILL_POOL[affinity].find(s => s.id === skillId);
        if (skill) return { ...skill, affinity };
    }
    return null;
}
