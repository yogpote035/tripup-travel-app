import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const initialState = {
  loading: false,
  loadingMore: false,
  error: null,
  posts: [],
  singlePost: null,
  comments: [],
  like: {
    likesCount: 0,
    liked: false,
  },
  bookmark: {
    bookmarksCount: 0,
    bookmarked: false,
  },
  pagination: { page: 1, hasMore: true, limit: 12 },
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    createPostRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createPostSuccess: (state, action) => {
      state.loading = false;
      state.posts = [action.payload, ...state.posts];
    },
    createPostFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    getAllPostRequest: (state, action) => {
      state.loading = !action.payload?.append;
      state.loadingMore = !!action.payload?.append;
      state.error = null;
    },
    getAllPostSuccess: (state, action) => {
      state.loading = false;
      state.loadingMore = false;
      const items = action.payload.items || action.payload || [];
      state.posts = action.payload.append ? [...state.posts, ...items] : items;
      state.pagination = action.payload.pagination || { page: 1, hasMore: false, limit: 12 };
    },
    getAllPostFailure: (state, action) => {
      state.loading = false;
      state.loadingMore = false;
      state.error = action.payload;
    },

    getSinglePostRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getSinglePostSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
      const post = action.payload;
      const currentUserId = localStorage.getItem("userId");
      state.singlePost = post;
      state.comments = post.comments || [];
      state.like.likesCount = post.likes?.length || 0;
      state.like.liked = (post.likes || []).some((like) => String(like?._id || like) === String(currentUserId));
      state.bookmark.bookmarksCount = post.bookmarks?.length || 0;
      state.bookmark.bookmarked = (post.bookmarks || []).some((bookmark) => String(bookmark?._id || bookmark) === String(currentUserId));
    },

    deletePostRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    deletePostSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    deletePostFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    updatePostRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updatePostSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    updatePostFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    toggleLikeSuccess: (state, action) => {
      const currentUserId = localStorage.getItem("userId");
      state.like.likesCount = action.payload.likesCount;
      state.like.liked = action.payload.liked;
      if (state.singlePost?._id === action.payload.postId) {
        state.singlePost = { ...state.singlePost, likes: state.singlePost.likes || [] };
      }
      state.posts = state.posts.map((post) => {
        if (post._id !== action.payload.postId) return post;
        const updatedLikes = action.payload.liked
          ? [...(post.likes || []), currentUserId].filter(Boolean)
          : (post.likes || []).filter((item) => String(item?._id || item) !== String(currentUserId));
        return { ...post, likes: updatedLikes };
      });
    },

    toggleBookmarkSuccess: (state, action) => {
      state.bookmark.bookmarksCount = action.payload.bookmarksCount;
      state.bookmark.bookmarked = action.payload.bookmarked;
      state.posts = state.posts.map((post) => post._id === action.payload.postId ? { ...post, bookmarks: action.payload.bookmarked ? [...(post.bookmarks || []), localStorage.getItem("userId")] : (post.bookmarks || []).filter((item) => String(item?._id || item) !== String(localStorage.getItem("userId"))) } : post);
      if (state.singlePost?._id === action.payload.postId) {
        state.singlePost = { ...state.singlePost, bookmarks: action.payload.bookmarked ? [...(state.singlePost.bookmarks || []), localStorage.getItem("userId")] : (state.singlePost.bookmarks || []).filter((item) => String(item?._id || item) !== String(localStorage.getItem("userId"))) };
      }
    },

    addAndDeleteComment: (state, action) => {
      state.loading = false;
      state.error = null;
      const { comments, updatedPost } = action.payload;
      state.comments = comments;
      state.singlePost = updatedPost;
      state.like.likesCount = updatedPost.likes.length;
      state.like.liked = (updatedPost.likes || []).some((like) => String(like?._id || like) === String(localStorage.getItem("userId")));
    },
  },
});

export const {
  createPostRequest,
  createPostSuccess,
  createPostFailure,
  getAllPostRequest,
  getAllPostSuccess,
  getAllPostFailure,
  getSinglePostRequest,
  getSinglePostSuccess,
  deletePostRequest,
  deletePostSuccess,
  deletePostFailure,
  toggleLikeSuccess,
  toggleBookmarkSuccess,
  addAndDeleteComment,
  updatePostRequest,
  updatePostSuccess,
  updatePostFailure,
} = postSlice.actions;

export default postSlice.reducer;

export const createPost =
  (formData, navigate) => async (dispatch, getState) => {
    dispatch(createPostRequest());
    try {
      const token = getState().auth.accessToken || localStorage.getItem("token");
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/posts`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(createPostSuccess(res.data.post));
      toast.success("Post created successfully!");
      navigate("/post");
    } catch (error) {
      const errMsg = error.response?.data?.message || "Something went wrong!";
      dispatch(createPostFailure(errMsg));
      toast.error(errMsg);
    }
  };

export const getAllPosts = (page = 1, append = false) => async (dispatch, getState) => {
  dispatch(getAllPostRequest({ append }));
  try {
    const token = getState().auth.accessToken || localStorage.getItem("token");
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/posts`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { page, limit: 12 },
    });
    dispatch(getAllPostSuccess({
      items: res.data?.data?.items || res.data?.items || res.data || [],
      pagination: res.data?.data?.pagination || { page: 1, hasMore: false, limit: 12 },
      append,
    }));
  } catch (error) {
    const errMsg = error.response?.data?.message || "Failed to fetch posts";
    dispatch(getAllPostFailure(errMsg));
    toast.error(errMsg);
  }
};

export const getMyPosts = (page = 1, append = false) => async (dispatch, getState) => {
  dispatch(getAllPostRequest({ append }));
  try {
    const token = getState().auth.accessToken || localStorage.getItem("token");
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/posts/my-posts`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { page, limit: 12 },
    });
    dispatch(getAllPostSuccess({
      items: Array.isArray(res.data) ? res.data : (res.data?.items || []),
      pagination: { page, hasMore: false, limit: 12 },
      append,
    }));
  } catch (error) {
    const errMsg = error.response?.data?.message || "Failed to fetch posts";
    dispatch(getAllPostFailure(errMsg));
    toast.error(errMsg);
  }
};

export const getSinglePost = (id) => async (dispatch, getState) => {
  if (!id) {
    return toast.warn("Post id is Required");
  }
  dispatch(getSinglePostRequest());
  try {
    const token = getState().auth.accessToken || localStorage.getItem("token");
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/posts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch(getSinglePostSuccess(res.data));
  } catch (error) {
    const errMsg = error.response?.data?.message || "Failed to fetch post";
    dispatch(getAllPostFailure(errMsg));
    toast.error(errMsg);
  }
};

export const updatePost = ({ id, formData, navigate }) => async (dispatch, getState) => {
  dispatch(updatePostRequest());
  try {
    const token = getState().auth.accessToken || localStorage.getItem("token");
    const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/posts/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch(updatePostSuccess());
    toast.success(res.data.message || "Post updated successfully!");
    if (res.data.id || id) {
      navigate(`/post/${id}`);
    } else {
      navigate("/post");
    }
  } catch (error) {
    const errMsg = error.response?.data?.message || "Something went wrong!";
    dispatch(updatePostFailure(errMsg));
    toast.error(errMsg);
  }
};

export const deletePost = (id, navigate) => async (dispatch, getState) => {
  if (!id) {
    return toast.warning("Id is Missing For Deletion");
  }
  dispatch(deletePostRequest());
  try {
    const token = getState().auth.accessToken || localStorage.getItem("token");
    const { data } = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/posts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch(deletePostSuccess());
    toast.success(data.message || "Post deleted successfully!");
    navigate("/post");
  } catch (error) {
    const errMsg = error.response?.data?.message || "Failed to delete post";
    dispatch(deletePostFailure(errMsg));
    toast.error(errMsg);
  }
};

export const toggleLike = (postId) => async (dispatch, getState) => {
  try {
    const token = getState().auth.accessToken || localStorage.getItem("token");
    const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/like`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch(toggleLikeSuccess({ ...res.data, postId }));
  } catch (error) {
    toast.error("Failed to like post");
  }
};

export const toggleBookmark = (postId) => async (dispatch, getState) => {
  try {
    const token = getState().auth.accessToken || localStorage.getItem("token");
    const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/bookmark`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch(toggleBookmarkSuccess({ ...res.data, postId }));
    toast.success(res.data.bookmarked ? "Post saved to bookmarks" : "Bookmark removed");
  } catch (error) {
    toast.error("Failed to update bookmark");
  }
};

export const reviewLocation = (postId, reviewData) => async (dispatch, getState) => {
  try {
    const token = getState().auth.accessToken || localStorage.getItem("token");
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/location-review`, reviewData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch(getSinglePost(postId));
    toast.success("Thanks for the review!");
  } catch (error) {
    toast.error(error.response?.data?.message || "Could not submit review");
  }
};

const debounceTimers = new Map();
export const toggleLikeDebounced = (postId) => (dispatch, getState) => {
  const userId = getState().auth.user?.userId;
  const post = getState().socialFeed.posts.find((item) => item._id === postId);
  if (!post || !userId) return;
  const liked = (post.likes || []).some((id) => String(id?._id || id) === String(userId));
  post.likes = liked ? post.likes.filter((id) => String(id?._id || id) !== String(userId)) : [...(post.likes || []), userId];
  dispatch(getAllPostSuccess({ items: [...getState().socialFeed.posts], pagination: getState().socialFeed.pagination }));
  clearTimeout(debounceTimers.get(`like:${postId}`));
  debounceTimers.set(`like:${postId}`, setTimeout(() => dispatch(toggleLike(postId)), 700));
};

export const toggleBookmarkDebounced = (postId) => (dispatch, getState) => {
  const userId = getState().auth.user?.userId;
  const post = getState().socialFeed.posts.find((item) => item._id === postId);
  if (!post || !userId) return;
  const saved = (post.bookmarks || []).some((id) => String(id?._id || id) === String(userId));
  post.bookmarks = saved ? post.bookmarks.filter((id) => String(id?._id || id) !== String(userId)) : [...(post.bookmarks || []), userId];
  dispatch(getAllPostSuccess({ items: [...getState().socialFeed.posts], pagination: getState().socialFeed.pagination }));
  clearTimeout(debounceTimers.get(`bookmark:${postId}`));
  debounceTimers.set(`bookmark:${postId}`, setTimeout(() => dispatch(toggleBookmark(postId)), 700));
};

export const addComment = (postId, text) => async (dispatch, getState) => {
  try {
    dispatch(getSinglePostRequest());
    const token = getState().auth.accessToken || localStorage.getItem("token");
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/comments`, { text }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch(addAndDeleteComment(res.data));
    toast.success("Comment added!");
  } catch (error) {
    dispatch(getAllPostFailure(error.response?.data?.message || "Error adding comment"));
    toast.error(error.response?.data?.message || "Error adding comment");
  }
};

export const deleteComment = (postId, commentId) => async (dispatch, getState) => {
  try {
    dispatch(getSinglePostRequest());
    const token = getState().auth.accessToken || localStorage.getItem("token");
    const res = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch(addAndDeleteComment(res.data));
    toast.success("Comment deleted!");
  } catch (error) {
    dispatch(getAllPostFailure(error.response?.data?.message || "Error deleting comment"));
    toast.error(error.response?.data?.message || "Error deleting comment");
  }
};
