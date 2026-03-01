/**
 * VR全景场景配置 - 本地备份数据
 * 优先从API获取，API失败时使用本地数据
 */
const vrScenes = {
  startScene: "scene_lobby",
  
  scenes: [
    {
      id: "scene_lobby",
      name: "展馆入口大厅",
      image: "https://oss.bjgjlc.com/drug-education/vr/VR1.jpg",
      imageSize: { width: 4096, height: 2048 },
      hotspots: [
        { id: "hs_to_drugs", type: "navigation", target_id: "scene_drugs", position: { x: 3200, y: 1024 }, label: "毒品展示区" },
        { id: "hs_welcome", type: "info", position: { x: 2048, y: 800 }, title: "欢迎来到禁毒教育展馆", content: "本展馆共设多个主题展区，涵盖毒品认知、危害警示、防范技巧等内容。" }
      ]
    },
    {
      id: "scene_drugs",
      name: "毒品展示区",
      image: "https://oss.bjgjlc.com/drug-education/vr/VR2.jpg",
      imageSize: { width: 4096, height: 2048 },
      hotspots: [
        { id: "hs_back_lobby", type: "navigation", target_id: "scene_lobby", position: { x: 800, y: 1024 }, label: "返回大厅" },
        { id: "hs_to_harm", type: "navigation", target_id: "scene_harm", position: { x: 3200, y: 1024 }, label: "危害警示区" }
      ]
    },
    {
      id: "scene_harm",
      name: "危害警示区",
      image: "https://oss.bjgjlc.com/drug-education/vr/VR3.jpg",
      imageSize: { width: 4096, height: 2048 },
      hotspots: [
        { id: "hs_back_drugs", type: "navigation", target_id: "scene_drugs", position: { x: 800, y: 1024 }, label: "返回展示区" },
        { id: "hs_to_prevention", type: "navigation", target_id: "scene_prevention", position: { x: 3200, y: 1024 }, label: "防范拒绝区" }
      ]
    },
    {
      id: "scene_prevention",
      name: "防范拒绝区",
      image: "https://oss.bjgjlc.com/drug-education/vr/VR4.jpg",
      imageSize: { width: 4096, height: 2048 },
      hotspots: [
        { id: "hs_back_harm", type: "navigation", target_id: "scene_harm", position: { x: 800, y: 1024 }, label: "返回警示区" },
        { id: "hs_to_law", type: "navigation", target_id: "scene_law", position: { x: 3200, y: 1024 }, label: "法律法规区" }
      ]
    },
    {
      id: "scene_law",
      name: "法律法规区",
      image: "https://oss.bjgjlc.com/drug-education/vr/VR5.jpg",
      imageSize: { width: 4096, height: 2048 },
      hotspots: [
        { id: "hs_back_prevention", type: "navigation", target_id: "scene_prevention", position: { x: 800, y: 1024 }, label: "返回防范区" },
        { id: "hs_to_rehab", type: "navigation", target_id: "scene_rehab", position: { x: 3200, y: 1024 }, label: "戒毒康复区" }
      ]
    },
    {
      id: "scene_rehab",
      name: "戒毒康复区",
      image: "https://oss.bjgjlc.com/drug-education/vr/VR6.jpg",
      imageSize: { width: 4096, height: 2048 },
      hotspots: [
        { id: "hs_back_law", type: "navigation", target_id: "scene_law", position: { x: 800, y: 1024 }, label: "返回法规区" },
        { id: "hs_to_hero", type: "navigation", target_id: "scene_hero", position: { x: 3200, y: 1024 }, label: "英雄致敬区" }
      ]
    },
    {
      id: "scene_hero",
      name: "英雄致敬区",
      image: "https://oss.bjgjlc.com/drug-education/vr/VR7.jpg",
      imageSize: { width: 4096, height: 2048 },
      hotspots: [
        { id: "hs_back_rehab", type: "navigation", target_id: "scene_rehab", position: { x: 800, y: 1024 }, label: "返回康复区" },
        { id: "hs_to_pledge", type: "navigation", target_id: "scene_pledge", position: { x: 3200, y: 1024 }, label: "承诺签名区" }
      ]
    },
    {
      id: "scene_pledge",
      name: "承诺签名区",
      image: "https://oss.bjgjlc.com/drug-education/vr/VR8.jpg",
      imageSize: { width: 4096, height: 2048 },
      hotspots: [
        { id: "hs_back_hero", type: "navigation", target_id: "scene_hero", position: { x: 800, y: 1024 }, label: "返回英雄区" },
        { id: "hs_to_interactive", type: "navigation", target_id: "scene_interactive", position: { x: 3200, y: 1024 }, label: "互动体验区" }
      ]
    },
    {
      id: "scene_interactive",
      name: "互动体验区",
      image: "https://oss.bjgjlc.com/drug-education/vr/VR9.jpg",
      imageSize: { width: 4096, height: 2048 },
      hotspots: [
        { id: "hs_back_pledge", type: "navigation", target_id: "scene_pledge", position: { x: 800, y: 1024 }, label: "返回签名区" },
        { id: "hs_to_exit", type: "navigation", target_id: "scene_exit", position: { x: 3200, y: 1024 }, label: "展馆出口" },
        { id: "hs_claw_game", type: "link", position: { x: 2048, y: 1100 }, label: "抓娃娃游戏", url: "/pages/claw/claw" }
      ]
    },
    {
      id: "scene_exit",
      name: "展馆出口",
      image: "https://oss.bjgjlc.com/drug-education/vr/VR10.jpg",
      imageSize: { width: 4096, height: 2048 },
      hotspots: [
        { id: "hs_back_interactive", type: "navigation", target_id: "scene_interactive", position: { x: 800, y: 1024 }, label: "返回体验区" },
        { id: "hs_to_lobby", type: "navigation", target_id: "scene_lobby", position: { x: 3200, y: 1024 }, label: "返回入口大厅" }
      ]
    },
    {
      id: "scene_special",
      name: "特别展区",
      image: "https://oss.bjgjlc.com/drug-education/vr/VR11.jpg",
      imageSize: { width: 4096, height: 2048 },
      hotspots: [
        { id: "hs_back_to_lobby", type: "navigation", target_id: "scene_lobby", position: { x: 2048, y: 1024 }, label: "返回入口大厅" }
      ]
    }
  ]
};

module.exports = { vrScenes };
