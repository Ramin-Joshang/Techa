"use client"
import { motion } from 'framer-motion';
import { Send, Heart, Bookmark, Share2 } from 'lucide-react';
import { useState } from 'react';

export const Comments = ({ comments }) => {
    const [newComment, setNewComment] = useState('');
    const [likedComments, setLikedComments] = useState([]);

    const handleLike = (commentId) => {
        setLikedComments(prev =>
            prev.includes(commentId)
                ? prev.filter(id => id !== commentId)
                : [...prev, commentId]
        );
    };

    return (
        <div className="mt-12">
            {/* فرم نظر جدید */}
            <motion.form
                className="mb-8 bg-gray-50 p-6 rounded-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="نظر خود را بنویسید..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 mb-4 bg-white"
                    rows="4"
                    required
                />
                <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            className="p-2 rounded-full hover:bg-gray-200"
                        >
                            <Bookmark className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                            type="button"
                            className="p-2 rounded-full hover:bg-gray-200"
                        >
                            <Share2 className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Send className="w-5 h-5" />
                        ارسال نظر
                    </button>
                </div>
            </motion.form>

            {/* لیست نظرات */}
            <div className="space-y-6">
                {comments.map((comment, index) => (
                    <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-6 rounded-2xl shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600 font-bold">{comment.user[0]}</span>
                                </div>
                                <div>
                                    <span className="font-medium">{comment.user}</span>
                                    <span className="text-sm text-gray-500"> - {comment.date}</span>
                                </div>
                            </div>
                            <button onClick={() => handleLike(comment.id)} className="p-2 rounded-full hover:bg-gray-200">
                                <Heart className={`w-5 h-5 ${likedComments.includes(comment.id) ? 'text-red-600' : 'text-gray-600'}`} />
                            </button>
                        </div>
                        <p className="text-gray-700">{comment.text}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};