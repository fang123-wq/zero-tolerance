// 禁毒飞车冲刺游戏配置
var clawMachineConfig = {
  costPerPlay: 100,           // 每次消耗积分
  baseWinRate: 0.25,          // 基础中奖率 25%
  dailyLimit: 10,             // 每日限制次数
  guaranteeAfterFails: 5,     // 连续失败N次后保底

  // 积分奖品配置
  prizes: [
    {
      id: 'points_50',
      name: '50积分',
      icon: '💰',
      image: '/assets/images/ww1.png',
      rarity: 'common',
      weight: 40,
      points: 50,
      description: '获得50积分奖励'
    },
    {
      id: 'points_100',
      name: '100积分',
      icon: '💎',
      image: '/assets/images/ww2.png',
      rarity: 'common',
      weight: 30,
      points: 100,
      description: '获得100积分奖励'
    },
    {
      id: 'points_200',
      name: '200积分',
      icon: '🏆',
      image: '/assets/images/ww3.png',
      rarity: 'rare',
      weight: 20,
      points: 200,
      description: '获得200积分奖励'
    },
    {
      id: 'points_500',
      name: '500积分',
      icon: '👑',
      image: '/assets/images/ww4.png',
      rarity: 'epic',
      weight: 10,
      points: 500,
      description: '获得500积分大奖！'
    }
  ],

  // 游戏参数
  game: {
    speedBase: 4,            // 基础速度
    speedMax: 8,             // 最大速度
    hpMax: 100,              // 最大血量
    hpDamage: 20,            // 撞击扣血
    spawnInterval: 40,       // 障碍物生成间隔(帧)
    laneCount: 3,            // 车道数
    starPoints: 10,          // 每颗星星分值
    distanceRatio: 0.2       // 距离积分系数
  }
};

module.exports = { clawMachineConfig: clawMachineConfig };
