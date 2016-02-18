var splitterRe = /^(@?[^@]+)@(\b(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)(?:-[\da-z\-]+(?:\.[\da-z\-]+)*)?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?\b)[^/]*(.*)/i;
module.exports = function(path){
  var parts = path.match(splitterRe);
  if(!parts){
    return {
      module: path
    }
  }
  return {
    module: parts[1],
    version: parts[2] || undefined,
    path: parts[3] || undefined
  }
}
