import React from "react";
import "./App.css";
import { API } from "aws-amplify";
import * as mutations from "./graphql/mutations";
import { GraphQLQuery } from "@aws-amplify/api";
import {
  CreateBlogInput,
  CreateBlogMutation,
  CreatePostInput,
  CreatePostMutation,
  CreateCommentInput,
  CreateCommentMutation,
  CreateTagInput,
  CreateTagMutation,
  CreatePostTagsInput,
  CreatePostTagsMutation,
  GetBlogQuery,
  GetPostQuery,
  GetTagQuery,
  ListBlogsQuery,
  ListPostsQuery,
  ListCommentsQuery,
  ListTagsQuery,
  ListPostTagsQuery,
  DeleteBlogInput,
  DeleteBlogMutation,
  DeletePostInput,
  DeletePostMutation,
  DeleteCommentInput,
  DeleteCommentMutation,
  DeleteTagInput,
  DeleteTagMutation,
  DeletePostTagsInput,
  DeletePostTagsMutation,
} from "./API";
import * as queries from "./graphql/queries";

function App() {
  //region Create
  const createBlog = async () => {
    const blogDetails: CreateBlogInput = {
      name: `Blog ${Date.now()}`,
    };

    const newBlog = await API.graphql<GraphQLQuery<CreateBlogMutation>>({
      query: mutations.createBlog,
      variables: { input: blogDetails },
    });

    console.log("newBlog", newBlog);

    return newBlog;
  };

  const createPost = async (currentBlogId: string) => {
    const postDetails: CreatePostInput = {
      title: `Post ${Date.now()}`,
      blogPostsId: currentBlogId,
    };

    const newPost = await API.graphql<GraphQLQuery<CreatePostMutation>>({
      query: mutations.createPost,
      variables: { input: postDetails },
    });

    console.log("newPost", newPost);

    return newPost;
  };

  const createComment = async (currentPostId: string) => {
    const commentDetails: CreateCommentInput = {
      content: `Comment ${Date.now()}`,
      postCommentsId: currentPostId,
    };

    const newComment = await API.graphql<GraphQLQuery<CreateCommentMutation>>({
      query: mutations.createComment,
      variables: { input: commentDetails },
    });

    console.log("newComment", newComment);

    return newComment;
  };

  const createTag = async () => {
    const tagDetails: CreateTagInput = {
      label: `Tag ${Date.now()}`,
    };

    const newTag = await API.graphql<GraphQLQuery<CreateTagMutation>>({
      query: mutations.createTag,
      variables: { input: tagDetails },
    });

    console.log("newTag", newTag);

    return newTag;
  };

  const createPostTag = async (currentPostId: string, currentTagId: string) => {
    const postTagDetails: CreatePostTagsInput = {
      postId: currentPostId,
      tagId: currentTagId,
    };

    const newPostTag = await API.graphql<GraphQLQuery<CreatePostTagsMutation>>({
      query: mutations.createPostTags,
      variables: { input: postTagDetails },
    });

    console.log("newPostTag", newPostTag);

    return newPostTag;
  };

  //endregion

  //region list Queries (without nested relations)
  const getBlogs = async () => {
    const allBlogs = await API.graphql<GraphQLQuery<ListBlogsQuery>>({
      query: queries.listBlogs,
    });
    console.log("Query Blogs: ", allBlogs);
    return allBlogs;
  };

  const getPosts = async () => {
    const allPosts = await API.graphql<GraphQLQuery<ListPostsQuery>>({
      query: queries.listPosts,
    });
    console.log("Query Posts: ", allPosts);
    return allPosts;
  };

  const getComments = async () => {
    const allComments = await API.graphql<GraphQLQuery<ListCommentsQuery>>({
      query: queries.listComments,
    });
    console.log("Query Comments", allComments);
    return allComments;
  };

  const getTags = async () => {
    const allTags = await API.graphql<GraphQLQuery<ListTagsQuery>>({
      query: queries.listTags,
    });
    console.log("Query Tags", allTags);
    return allTags;
  };

  const getPostTags = async () => {
    const allPostTags = await API.graphql<GraphQLQuery<ListPostTagsQuery>>({
      query: queries.listPostTags,
    });
    console.log("Query PostTags", allPostTags);
    return allPostTags;
  };
  //endregion

  //region query single records (will contain nested records)
  // Get blog with nested posts:
  const getBlog = async (blogId: string) => {
    if (!blogId) return;
    const blog = await API.graphql<GraphQLQuery<GetBlogQuery>>({
      query: queries.getBlog,
      variables: { id: blogId },
    });

    console.log(
      "%c BLOG WITH NESTED POSTS:",
      "font-weight: bold; color: red;",
      blog
    );
    return blog;
  };

  // Get Post with nested Comments + Tags:
  const getPost = async (postId: string) => {
    if (!postId) return;
    const post = await API.graphql<GraphQLQuery<GetPostQuery>>({
      query: queries.getPost,
      variables: { id: postId },
    });
    console.log(
      "%c POST WITH NESTED RECORDS AND COMMENTS",
      "font-weight: bold; color: red;",
      post
    );
    return post;
  };

  // Demonstrate inverse post / tag retrieval:
  const getTag = async () => {
    const allTags = await getTags();
    const firstTag = allTags?.data?.listTags?.items[0];
    const tagId = firstTag?.id;
    const tag = await API.graphql<GraphQLQuery<GetTagQuery>>({
      query: queries.getTag,
      variables: { id: tagId },
    });
    console.log(
      "%c TAG WITH NESTED RECORDS",
      "font-weight: bold; color: red;",
      tag
    );
    return tag;
  };

  //endregion

  // Query all related models connected to first Blog entry
  const queryAllRelations = async () => {
    // Retrieve all blogs:
    const blogs = await getBlogs();
    console.log("blogs", blogs);

    const firstBlogId = blogs?.data?.listBlogs?.items[0]?.id;
    console.log("firstBlogId", firstBlogId);

    if (!firstBlogId) return;

    // Get first blog
    const blog = await getBlog(firstBlogId);
    console.log("first blog", blog);

    const postsFromBlog = blog?.data?.getBlog?.posts?.items;

    if (!postsFromBlog) return;

    // Get each post to retrieve nested comments and tags:
    await postsFromBlog.forEach(async (post) => {
      if (!post) return;
      const postId = post.id;
      await getPost(postId);
    });

    // Demonstrate inverse post / tag retrieval:
    await getTag();
  };

  // Query all models independent of relations
  const queryAllIndependent = async () => {
    const blogs = await getBlogs();
    const posts = await getPosts();
    const comments = await getComments();
    const tags = await getTags();
    const postTags = await getPostTags();
    const allRecords = {
      blogs,
      posts,
      comments,
      tags,
      postTags,
    };
    console.log("allRecords", allRecords);
    return allRecords;
  };

  /**
   * Creates connected Blog, Post, Comment, and Tag.
   * Lastly, queries all records and prints to console
   */
  const createRelationsAndQuery = async () => {
    const blog = await createBlog();
    console.log("created blog:", blog);

    const blogId = blog?.data?.createBlog?.id;

    if (!blogId) return;

    //region Post1 and related records:
    const post1 = await createPost(blogId);

    const post1Id = post1?.data?.createPost?.id;

    if (!post1Id) return;

    await createComment(post1Id);

    const tag1 = await createTag();
    const tag1Id = tag1?.data?.createTag?.id;

    if (!tag1Id) return;

    // Create m:n relation:
    await createPostTag(post1Id, tag1Id);

    //endregion

    //region Post2 and related records:

    const post2 = await createPost(blogId);
    const post2Id = post2?.data?.createPost?.id;

    if (!post2Id) return;

    await createComment(post2Id);
    await createComment(post2Id);
    const tag2 = await createTag();
    const tag2Id = tag2?.data?.createTag?.id;
    const tag3 = await createTag();
    const tag3Id = tag3?.data?.createTag?.id;

    if (!tag2Id || !tag3Id) return;

    // Create m:n relation:
    await createPostTag(post2Id, tag2Id);

    // Create m:n relation:
    await createPostTag(post2Id, tag3Id);

    //endregion

    await queryAllRelations();
  };

  // TODO: `allRecords` is an artifcate of how I was previously deleting records
  // update so that you don't pass all records to each delete function
  const deleteAllPostTags = async (allRecords: any) => {
    if (allRecords.postTags.data.listPostTags.items.length === 0) return;
    try {
      // PostTags
      await allRecords.postTags.data.listPostTags.items.forEach(
        async (postTag: any) => {
          if (!postTag) return;

          const postTagDetails: DeletePostTagsInput = {
            id: postTag.id,
          };

          const deletedPostTag = await API.graphql<
            GraphQLQuery<DeletePostTagsMutation>
          >({
            query: mutations.deletePostTags,
            variables: { input: postTagDetails },
          });

          console.log("deletedPostTag", deletedPostTag);
        }
      );
    } catch (e) {
      console.log("error with delete", e);
    }
  };

  const deleteAllBlogs = async (allRecords: any) => {
    if (allRecords.blogs.data.listBlogs.items.length === 0) return;
    try {
      // Blogs
      await allRecords.blogs.data.listBlogs.items.forEach(async (blog: any) => {
        if (!blog) return;

        const blogDetails: DeleteBlogInput = {
          id: blog.id,
        };

        const deletedBlog = await API.graphql<GraphQLQuery<DeleteBlogMutation>>(
          {
            query: mutations.deleteBlog,
            variables: { input: blogDetails },
          }
        );

        console.log("deletedBlog", deletedBlog);
      });
    } catch (e) {
      console.log("error with delete", e);
    }
  };

  const deleteAllPosts = async (allRecords: any) => {
    if (allRecords.posts.data.listPosts.items.length === 0) return;
    try {
      // Posts
      await allRecords.posts.data.listPosts.items.forEach(async (post: any) => {
        if (!post) return;

        const postDetails: DeletePostInput = {
          id: post.id,
        };

        const deletedPost = await API.graphql<GraphQLQuery<DeletePostMutation>>(
          {
            query: mutations.deletePost,
            variables: { input: postDetails },
          }
        );

        console.log("deletedPost", deletedPost);
      });
    } catch (e) {
      console.log("error with delete", e);
    }
  };

  const deleteAllComments = async (allRecords: any) => {
    if (allRecords.comments.data.listComments.items.length === 0) return;
    try {
      // Comments
      await allRecords.comments.data.listComments.items.forEach(
        async (comment: any) => {
          if (!comment) return;

          const commentDetails: DeleteCommentInput = {
            id: comment.id,
          };

          const deletedComment = await API.graphql<
            GraphQLQuery<DeleteCommentMutation>
          >({
            query: mutations.deleteComment,
            variables: { input: commentDetails },
          });

          console.log("deletedComment", deletedComment);
        }
      );
    } catch (e) {
      console.log("error with delete", e);
    }
  };

  const deleteAllTags = async (allRecords: any) => {
    if (allRecords.tags.data.listTags.items.length === 0) return;
    try {
      // Tags
      await allRecords.tags.data.listTags.items.forEach(async (tag: any) => {
        if (!tag) return;

        const tagDetails: DeleteTagInput = {
          id: tag.id,
        };

        const deletedTag = await API.graphql<GraphQLQuery<DeleteTagMutation>>({
          query: mutations.deleteTag,
          variables: { input: tagDetails },
        });

        console.log("deletedTag", deletedTag);
      });
    } catch (e) {
      console.log("error with delete", e);
    }
  };

  const deleteAll = async () => {
    const allRecords: any = await queryAllIndependent();
    console.log("all records before delete: ", allRecords);
    // TODO: this is an artifact from a different implementation -
    // update this so we're not passing all records to each delete function
    await deleteAllPostTags(allRecords);
    await deleteAllBlogs(allRecords);
    await deleteAllPosts(allRecords);
    await deleteAllComments(allRecords);
    await deleteAllTags(allRecords);

    console.log(
      "%c TESTING DELETE ALL RESULTS:",
      "font-weight: bold; color: red;"
    );

    // Validate that all records are deleted
    await queryAllIndependent();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Amplify GraphQL API Relational CRUD</h1>
        <p>Note: Results of all operations are printed to the console</p>
        <button onClick={createRelationsAndQuery}>
          Create All Relations, Then Query
        </button>
        <button onClick={queryAllRelations}>Query All Relations</button>
        <button onClick={queryAllIndependent}>Query All Independent</button>
        <button onClick={deleteAll}>Delete All</button>
      </header>
    </div>
  );
}

export default App;
