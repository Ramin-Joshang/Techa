import { motion } from "framer-motion";
import { ChevronRight, Code, HelpCircle } from "lucide-react";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const QuestionCard = ({ question, onAnswer, showExplanation, setShowExplanation }) => {
    return (
        <motion.div
            key={question.id}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-emerald-100/50 bg-gradient-to-b from-white to-emerald-50"
        >
            {question?.type === 'code' && (
                <div className="p-4 bg-gray-800" dir="ltr">
                    <div className="flex items-center justify-between text-emerald-400 text-sm mb-2">
                        <span>{question.lang}</span>
                        <span className="px-2 py-1 rounded-full bg-emerald-900/20 text-emerald-400">
                            {question.difficulty}
                        </span>
                    </div>
                    <SyntaxHighlighter
                        language={question.lang}
                        style={atomOneLight}
                        customStyle={{
                            background: 'transparent',
                            padding: 0,
                            margin: 0,
                            fontSize: '14px'
                        }}
                    >
                        {question.code}
                    </SyntaxHighlighter>
                </div>
            )}

            <div className="p-6">
                <div className="flex items-start gap-3 mb-6">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                        {question?.type === 'code' ?
                            <Code className="w-5 h-5" /> :
                            <HelpCircle className="w-5 h-5" />
                        }
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 flex-1 leading-relaxed">
                        {question.question}
                    </h2>
                </div>

                <div className="grid gap-3 mb-6">
                    {question.options.map((option, index) => (
                        <motion.button
                            key={index}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onAnswer(index)}
                            className="p-4 text-right bg-emerald-50/50 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100 hover:border-emerald-300 flex items-center gap-3 group"
                        >
                            <span className="w-6 h-6 flex items-center justify-center bg-emerald-600 text-white rounded-md text-sm font-medium shadow-inner">
                                <span className="h-4">
                                    {String.fromCharCode(65 + index)}
                                </span>
                            </span>
                            <span className="flex-1 text-gray-700 group-hover:text-emerald-800">
                                {option}
                            </span>
                        </motion.button>
                    ))}
                </div>

                {question.explanation && (
                    <div className="mt-6">
                        <button
                            onClick={() => setShowExplanation(!showExplanation)}
                            className="text-sm text-emerald-600 hover:text-emerald-800 flex items-center gap-1 font-medium"
                        >
                            {showExplanation ? 'پنهان کردن توضیحات' : 'نمایش توضیحات'}
                            <ChevronRight className={`w-4 h-4 transition-transform ${showExplanation ? 'rotate-90' : ''
                                }`} />
                        </button>

                        {showExplanation && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="mt-3 p-4 bg-emerald-50 rounded-lg text-sm text-emerald-800 border border-emerald-100"
                            >
                                {question.explanation}
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default QuestionCard;