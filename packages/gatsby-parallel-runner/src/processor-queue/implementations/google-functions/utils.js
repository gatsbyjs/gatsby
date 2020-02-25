exports.topicFor = function(processor) {
  return `${process.env.WORKER_TOPIC || `gatsby_worker`}_${processor.name}`
}

exports.bucketFor = function(processor) {
  return `${process.env.WORKER_TOPIC || `gatsby_worker`}_${processor.name}`
}
