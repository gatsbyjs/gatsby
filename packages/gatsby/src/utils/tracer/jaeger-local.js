const jaeger = require(`jaeger-client`)

module.exports = () => {

  const config = {
    serviceName: `gatsby`,
    sampler: {
      type: "const",
      param: 1,
    },
    reporter: {
      flushIntervalMs: 500,
    },
  }
  
  const options = {
    logger: {
      info(msg) {
        console.log("INFO", msg);
      },
      error(msg) {
        console.log("ERROR", msg);
      },
    },
  };
  
  return jaeger.initTracer(config, options);
}
