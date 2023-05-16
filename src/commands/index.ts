import ping from "./ping";
import givePoints from "./give-point";
import showUserPoints from "./show-user-points";
import myPoints from "./my-points";
import removePoints from "./remove-points";
import showLeaderboard from "./show-leaderboard";

export default new Map([
  [ping.data.name, ping],
  [givePoints.data.name, givePoints],
  [showUserPoints.data.name, showUserPoints],
  [myPoints.data.name, myPoints],
  [removePoints.data.name, removePoints],
  [showLeaderboard.data.name, showLeaderboard],
]);
