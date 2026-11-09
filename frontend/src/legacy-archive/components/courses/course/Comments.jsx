"use client";
import { useState, useMemo } from 'react';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { AddReview, fetchReviews } from '../../../features/main/reviews/reviewsActions';

const Comments = ({ reviews = [], docId, currentUserId = 9 }) => {

    const dispatch = useDispatch()

    const structuredComments = useMemo(() => {
        if (!reviews || reviews.length === 0) return [];
        const mappedReviews = reviews.map(review => ({
            id: review.Id,
            parentId: review.ParentId,
            userName: review.UserName || "کاربر ناشناس",
            userAvatar: review.Avatar || `https://ui-avatars.com/api/?name=${review.UserName}&background=random`,
            rating: review.Rating || 0,
            date: review.CreatedAt,
            comment: review.Content,
            depth: review.Depth,
            sortPath: review.SortPath,
            replies: []
        }));

        const commentMap = {};
        const rootComments = [];

        mappedReviews.forEach(review => {
            commentMap[review.id] = review;
        });

        mappedReviews.forEach(review => {
            if (review.parentId) {
                if (commentMap[review.parentId]) {
                    commentMap[review.parentId].replies.push(review);
                }
            } else {
                rootComments.push(review);
            }
        });

        // مرتب‌سازی بر اساس تاریخ (جدیدترین اول)
        return rootComments.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [reviews]);

    // هندل کردن افزودن نظر جدید (والد)
    // 1. افزودن نظر اصلی
    const handleAddComment = async (newCommentData, resetForm) => {
        if (!currentUserId) {
            toast.error("لطفاً ابتدا وارد حساب کاربری خود شوید");
            return;
        }

        if (!newCommentData.comment.trim()) {
            toast.warn("متن نظر نمی‌تواند خالی باشد");
            return;
        }

        const payload = {
            DocId: docId,           // ← توجه: در جدول شما DocId است نه CourseId
            UserId: currentUserId,
            // ParentId: null,  
            Rating: newCommentData.rating ? Number(newCommentData.rating) : null,
            Content: newCommentData.comment.trim(),
        };

        console.log("Sending new review:", payload);

        try {
            // فرض: AddReview یک thunk است که promise برمی‌گرداند
            const resultAction = await dispatch(AddReview(payload)).unwrap();

            // اگر backend Id جدید رو برگردوند می‌تونی استفاده کنی
            console.log("Review added successfully:", resultAction);

            toast.success("نظر شما با موفقیت ثبت شد و پس از تأیید نمایش داده خواهد شد");

            resetForm();           // پاک کردن فرم

            // آپدیت لیست نظرات (یکی از این دو روش معمولاً کافی است)
            dispatch(fetchReviews({ DocId: docId }));
            // ← پیشنهاد اصلی

        } catch (error) {
            console.error("Error adding review:", error);

            const errorMessage =
                error?.message ||
                error?.data?.message ||
                "خطایی در ثبت نظر رخ داد. لطفاً دوباره تلاش کنید";

            toast.error(errorMessage);
        }
    };

    // هندل کردن افزودن پاسخ (فرزند)
    // 2. افزودن پاسخ به نظر
    const handleAddReply = async (parentId, text, setReplyText) => {
        if (!currentUserId) {
            toast.error("لطفاً ابتدا وارد حساب کاربری خود شوید");
            return;
        }

        const trimmedText = text?.trim();
        if (!trimmedText) {
            toast.warn("متن پاسخ نمی‌تواند خالی باشد");
            return;
        }

        // پیدا کردن والد برای محاسبه Depth (اختیاری اما مفید)
        const parentComment = reviews.find(r => r.Id === parentId);
        if (!parentComment) {
            toast.error("نظر مورد نظر پیدا نشد");
            return;
        }

        const payload = {
            DocId: docId,
            UserId: currentUserId,
            ParentId: parentId,
            // Rating: null,               // پاسخ‌ها امتیاز ندارند
            Content: trimmedText,
            // Depth: (parentComment.Depth || 0) + 1,
            // SortPath: ""                // می‌تونی در backend با trigger یا logic پر کنی
        };

        console.log("Sending reply:", payload);

        try {
            const resultAction = await dispatch(AddReview(payload)).unwrap();

            toast.success("پاسخ شما با موفقیت ثبت شد");

            // پاک کردن فیلد پاسخ
            if (setReplyText) setReplyText("");

            // آپدیت لیست نظرات
            dispatch(fetchReviews({ DocId: docId }));

            // اگر می‌خواهی optimistic reply اضافه کنی:
            // dispatch(addReplyOptimistic({ ...payload, Id: tempId, CreatedAt: new Date() }));

        } catch (error) {
            console.error("Error adding reply:", error);

            const errorMessage =
                error?.message ||
                error?.data?.message ||
                "خطایی در ثبت پاسخ رخ داد";

            toast.error(errorMessage);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-1 bg-emerald-500 rounded-full"></div>
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                    نظرات <span className="text-emerald-500">دانشجویان</span>
                </h2>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full mr-2">
                    {reviews.length} دیدگاه
                </span>
            </div>

            <CommentForm handleAddComment={handleAddComment} />

            <CommentList
                comments={structuredComments}
                handleAddReply={handleAddReply}
            />
        </div>
    );
};

export default Comments;