"use client";
import CommentItem from './CommentItem';
import { AnimatePresence } from 'framer-motion';

const CommentList = ({ comments, handleAddReply }) => {
    if (!comments || comments.length === 0) {
        return (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <p className="text-slate-500">هنوز نظری ثبت نشده است. اولین نفر باشید!</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <AnimatePresence>
                {comments.map((comment, index) => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        index={index}
                        handleAddReply={handleAddReply}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default CommentList;