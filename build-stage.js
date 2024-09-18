function setBuildNumber() {
  // noinspection ES6ConvertVarToLetConst
  var fs = require("fs");
  // noinspection ES6ConvertVarToLetConst
  var file_path = "src/assets/build-details/build-details.json";
  fs.unlinkSync(file_path);
  // noinspection ES6ConvertVarToLetConst
  var json = JSON.stringify({
    buildNumber: "2.1.5",
  });
  fs.writeFile(file_path, json, function (err) {
    if (err) throw err;
  });
}

setBuildNumber();
