import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const initialState = {
  loading: false,
  error: null,
  posts: [],         // list of all posts
  singlePost: null,  // currently viewed post
  comments: [],      // comments for singlePost
  like: {
    likesCount: 0,
    liked: false,
  },
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    // Create Post
    createPostRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createPostSuccess: (state, action) => {
      state.loading = false;
      state.posts.unshift(action.payload); // add new post at top
    },
    createPostFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Get All Posts
    getAllPostRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getAllPostSuccess: (state, action) => {
      state.loading = false;
      state.posts = action.payload || [];
    },
    getAllPostFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Get Single Post
    getSinglePostRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getSinglePostSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
      const post = action.payload;
      state.singlePost = post;
      state.comments = post.comments || [];
      state.like.likesCount = post.likes.length;
      state.like.liked = post.likes.some(
        (like) => like._id === localStorage.getItem("userId")
      );
    },

    // Delete Post
    deletePostRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    deletePostSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
    },
    deletePostFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update Post
    updatePostRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updatePostSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
    },
    updatePostFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Like/Unlike Post
    toggleLikeSuccess: (state, action) => {
      state.like.likesCount = action.payload.likesCount;
      state.like.liked = action.payload.liked;
    },

    // Add or Delete Comment
    addAndDeleteComment: (state, action) => {
      state.loading = false;
      state.error = null;
      const { comments, updatedPost } = action.payload;
      state.comments = comments;
      state.singlePost = updatedPost;
      state.like.likesCount = updatedPost.likes.length;
      state.like.liked = updatedPost.likes.some(
        (like) => like._id === localStorage.getItem("userId")
      );
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
      const token = getState().auth.token || localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/posts`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(createPostSuccess(res.data.post));
      toast.success("Post created successfully!");
      navigate("/post");
    } catch (error) {
      const errMsg = error.response?.data?.message || "Something went wrong!";
      dispatch(createPostFailure(errMsg));
      toast.error(errMsg);
    }
  };

export const getAllPosts = () => async (dispatch, getState) => {
  dispatch(getAllPostRequest());
  try {
    const token = getState().auth.token || localStorage.getItem("token");
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/posts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch(getAllPostSuccess(res.data));
  } catch (error) {
    const errMsg = error.response?.data?.message || "Failed to fetch posts";
    dispatch(getAllPostFailure(errMsg));
    toast.error(errMsg);
  }
};

export const getMyPosts = () => async (dispatch, getState) => {
  dispatch(getAllPostRequest());
  try {
    const token = localStorage.getItem("token") || getState().auth.token;
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/posts/my-posts`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    dispatch(getAllPostSuccess(res.data));
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
    const token = localStorage.getItem("token") || getState().auth.token;
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/posts/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    dispatch(getSinglePostSuccess(res.data));
  } catch (error) {
    const errMsg = error.response?.data?.message || "Failed to fetch post";
    dispatch(getAllPostFailure(errMsg));
    toast.error(errMsg);
  }
};

export const updatePost =
  ({ id, formData, navigate }) =>
  async (dispatch, getState) => {
    dispatch(updatePostRequest());
    try {
      const token = getState().auth.token || localStorage.getItem("token");
      const res = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/posts/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
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
    const token = getState().auth.token || localStorage.getItem("token");
    const { data } = await axios.delete(
      `${import.meta.env.VITE_API_BASE_URL}/posts/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
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
    const token = getState().auth.token || localStorage.getItem("token");
    const res = await axios.put(
      `${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/like`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    dispatch(toggleLikeSuccess(res.data));
  } catch (error) {
    toast.error("Failed to like post");
  }
};

export const addComment = (postId, text) => async (dispatch, getState) => {
  try {
    const username =
      localStorage.getItem("username") || getState().auth?.user?.username;
    dispatch(getSinglePostRequest());
    const token = getState().auth.token || localStorage.getItem("token");
    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/comments`,
      { text, username },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    dispatch(addAndDeleteComment(res.data));
    toast.success("Comment added!");
  } catch (error) {
    dispatch(
      getAllPostFailure(error.response?.data?.message || "Error adding comment")
    );
    toast.error(error.response?.data?.message || "Error adding comment");
  }
};

export const deleteComment =
  (postId, commentId) => async (dispatch, getState) => {
    try {
      dispatch(getSinglePostRequest());
      const token = getState().auth.token || localStorage.getItem("token");
      const res = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(addAndDeleteComment(res.data));
      toast.success("Comment deleted!");
    } catch (error) {
      dispatch(
        getAllPostFailure(
          error.response?.data?.message || "Error deleting comment"
        )
      );
      toast.error(error.response?.data?.message || "Error deleting comment");
    }
  };
    