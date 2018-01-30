const _ = require(`lodash`)

class Normalizer {

    /**
     * Normalizer Constructor
     * 
     * @param  {Array} entitys
     * @param  {Object} args
     * @return {Object} this
     */
    constructor(entitys, args) {
        this.entitys = entitys
        this.args = args
        this.normalizers = []
        this.queue = []
    }

    /**
     * Set Normalizers
     * 
     * @param {Function} normalizer
     * @param {null|Number} priority
     * @return {Object}
     */
    set(normalizer, priority = null) {
        let property = priority === null ? `queue` : `normalizers`

        this[property].push({
            normalizer,
            priority,
        })

        return this
    }

    /**
     * Normalize the entities
     * 
     * @return {Array}
     */
    async normalize() {
        var normalizers = this.getNormalizers()
        for (let i = 0; i < normalizers.length; i++) {
            this.entitys = await normalizers[i].normalizer(this.entitys, this.args)
        }

        return this.entitys
    }

    /**
     * Concat the queue and prioritised normalizers
     * 
     * @return {Array}
     */
    getNormalizers() {
        return _.concat(
            this.normalizers.sort((a, b) => a.priority - b.priority),
            this.queue
        )
    }

}

module.exports = Normalizer