var STORY_ENDING_POINTS = 30;
var ENDING_REWARD_KEY_PREFIX = 'storyEndingReward';

function getUserId(userInfo) {
  if (!userInfo) return '';
  return (
    userInfo.id ||
    userInfo.userId ||
    userInfo.openId ||
    userInfo.openid ||
    userInfo.unionId ||
    ''
  );
}

function getRewardUserKey(app) {
  var globalData = app && app.globalData ? app.globalData : null;
  var userInfo = globalData ? globalData.userInfo : null;
  var userId = getUserId(userInfo);
  if (!userId && globalData && globalData.token) {
    userId = 'token_' + globalData.token;
  }
  return userId || 'guest';
}

function getEndingRewardKey(app, storyId, endingId) {
  var userKey = getRewardUserKey(app);
  if (!userKey) return '';
  if (!storyId || !endingId) return '';
  return ENDING_REWARD_KEY_PREFIX + ':' + userKey + ':' + String(storyId) + ':' + String(endingId);
}

function isLoggedIn(app) {
  return !!(app && app.globalData && app.globalData.isLoggedIn);
}

function hasClaimedEnding(app, storyId, endingId) {
  var rewardKey = getEndingRewardKey(app, storyId, endingId);
  if (!rewardKey) return false;
  return !!wx.getStorageSync(rewardKey);
}

function markClaimedEnding(app, storyId, endingId) {
  var rewardKey = getEndingRewardKey(app, storyId, endingId);
  if (!rewardKey) return;
  wx.setStorageSync(rewardKey, Date.now());
}

function claimStoryEndingReward(app, storyId, endingId, reason) {
  return new Promise(function(resolve) {
    if (!storyId || !endingId) {
      resolve({ awardedPoints: 0, status: 'invalid_key' });
      return;
    }

    if (hasClaimedEnding(app, storyId, endingId)) {
      resolve({ awardedPoints: 0, status: 'already_claimed' });
      return;
    }

    app.addPoints(STORY_ENDING_POINTS, reason || '\u6c89\u6d78\u5f0f\u6545\u4e8b\u7ed3\u5c40\u5956\u52b1').then(function() {
      markClaimedEnding(app, storyId, endingId);
      resolve({ awardedPoints: STORY_ENDING_POINTS, status: 'awarded' });
    }).catch(function(err) {
      resolve({ awardedPoints: 0, status: 'failed', error: err });
    });
  });
}

function claimDailyStoryReward(app, reason) {
  // Backward compatibility only.
  return claimStoryEndingReward(app, 'story_daily_compat', 'default', reason);
}

module.exports = {
  STORY_ENDING_POINTS: STORY_ENDING_POINTS,
  claimStoryEndingReward: claimStoryEndingReward,
  claimDailyStoryReward: claimDailyStoryReward,
  _getRewardUserKey: getRewardUserKey
};
