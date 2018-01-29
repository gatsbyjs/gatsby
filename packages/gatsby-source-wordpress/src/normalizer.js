
class Normalizer {

    constructor(entitys, args) {
        this.entitys = entitys
        this.args = args
        this.normalizers = []
    }

    set(normalizer, priority = null) {
        // if the priority is null push last
        this.normalizers.push({
            normalizer,
            priority,
        })

        return this
    }

    async normalize() {
        let ordered = this.normalizers.sort((a, b) => a.priority - b.priority)

        for (let i = 0; i < ordered.length; i++) {
            var normalizedEntities = await ordered[i].normalizer(this.entitys, this.args)

            if (typeof normalizedEntities !== `object`) {
                continue
            }

            this.entitys = normalizedEntities
        }

        return this.entitys
    }

}

module.exports = Normalizer