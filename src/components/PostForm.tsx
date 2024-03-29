import AuthContext from "context/AuthContext";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db, app } from "firebaseApp";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { CATEGORIES, CategoryType, PostInterface } from "./PostList";


export default function PostForm() {
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<CategoryType>("Frontend");
  const [summary, setSummary] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [post, setPost] = useState<PostInterface | null>(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    if (params?.id) {
      getPost(params?.id);
    }
  }, [params?.id]);

  useEffect(() => {
    if (post) {
      setTitle(post?.title);
      setSummary(post?.summary);
      setContent(post?.content);
      setCategory(post?.category as CategoryType);
    }
  }, [post]);

  const getPost = async (id: string) => {
    if (id) {
      const docRef = doc(db, "posts", id);
      const docSnap = await getDoc(docRef);
      setPost({ id: docSnap?.id, ...docSnap.data() as PostInterface });
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (post && post?.id) {
      try {
        const postRef = doc(db, "posts", post?.id);
        await updateDoc(postRef, {
          title: title,
          category: category,
          summary: summary,
          content: content,
          updatedAt: new Date()?.toLocaleDateString("ko", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        });

        toast.success("게시글을 수정했습니다.");
        navigate("/");
      } catch (error: any) {
        toast.error(error?.code);
      }
    } else {
      try {
        await addDoc(collection(db, "posts"), {
          title: title,
          category: category,
          summary: summary,
          content: content,
          createAt: new Date()?.toLocaleDateString("ko", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          email: user?.email,
          uid: user?.uid,
        });

        toast.success("게시글을 생성했습니다.");
        navigate("/");
      } catch (error: any) {
        console.log(error);
        toast.error(error?.code);
      }
    }
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { target: { name, value } } = e;
    
    if (name === "title") {
      setTitle(value);
    }
    if (name === "category") {
      setCategory(value as CategoryType);
    }
    if (name === "summary") {
      setSummary(value);
    }
    if (name === "content") {
      setContent(value);
    }
  };

  return (
    <form onSubmit={onSubmit} className="form">
      <div className="form__block">
        <label htmlFor="title">제목</label>
        <input type="text" name="title" id="title" onChange={onChange} value={title} required />
      </div>
      <div className="form__block">
        <label htmlFor="category">카테고리</label>
        <select name="category" id="category" onChange={onChange} value={category} required>
          <option value="">카테고리를 선택해주세요</option>
          {CATEGORIES?.map((cat) => (
            <option value={cat} key={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="form__block">
        <label htmlFor="summary">요약</label>
        <input type="text" name="summary" id="summary" onChange={onChange} value={summary} required />
      </div>
      <div className="form__block">
        <label htmlFor="content">내용</label>
        <textarea name="content" id="content" onChange={onChange} value={content} required />
      </div>
      <div className="form__block">
        <input type="submit" value={!post ? "발행" : "수정"} className="form__btn--submit" />
      </div>
    </form>
  );
}