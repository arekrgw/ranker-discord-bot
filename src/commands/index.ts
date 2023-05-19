import ping from "./ping";
import givePoints from "./give-point";
import showUserPoints from "./show-user-points";
import myPoints from "./my-points";
import removePoints from "./remove-points";
import showLeaderboard from "./show-leaderboard";
import exportCsv from "./export-csv";

export default new Map([
  [ping.data.name, ping],
  [givePoints.data.name, givePoints],
  // [myPoints.data.name, myPoints],
  [showUserPoints.data.name, showUserPoints],
  [removePoints.data.name, removePoints],
  [showLeaderboard.data.name, showLeaderboard],
  [exportCsv.data.name, exportCsv],
]);
