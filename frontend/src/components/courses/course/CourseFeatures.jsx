import { motion } from 'framer-motion'


const CourseFeatures = ({ features }) => {
    return (
        <section className="py-16">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                {features.slice(0, 3).map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white p-8 rounded-2xl shadow-lg border border-emerald-100 hover:border-emerald-200 transition-all"
                    >
                        <div className="text-emerald-600 mb-4">{feature.icon}</div>
                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}

export default CourseFeatures