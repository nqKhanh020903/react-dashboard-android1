import React, { useEffect, useState } from "react";
import Select from "react-select";
import { database } from '../firebase/firebase';
import { ref, push, set, get } from "firebase/database";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Button,
} from "reactstrap";
import { useLocation, useNavigate } from "react-router-dom";

function Post() {
  const [cayThuocList, setCayThuocList] = useState([]);
  const [selectedCayThuoc, setSelectedCayThuoc] = useState([]);

  const [postData, setPostData] = useState({
    TieuDe: "",
    TomTatNoiDung: "",
    TacGia: "",
    ThamVanYKhoa: "",
    CayThuocId: [],
    Image: "",
    NgayDang: "",
    Nguon: "",
  });

  const location = useLocation();
  const navigate = useNavigate();
  const postId = new URLSearchParams(location.search).get("id");

  useEffect(() => {
    // Lấy danh sách cây thuốc từ Firebase
    const fetchCayThuoc = async () => {
      const snapshot = await get(ref(database, 'CayThuoc'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const cayThuocArray = Object.values(data).map(item => ({
          value: item.Id,
          label: item.TenThuoc
        }));
        setCayThuocList(cayThuocArray); // Cập nhật danh sách cây thuốc
      }
    };

    fetchCayThuoc();

    // Nếu có ID bài viết (đang sửa), lấy dữ liệu bài viết đó
    if (postId) {
      const fetchPost = async () => {
        const postRef = ref(database, `Post/${postId - 1}`);
        const snapshot = await get(postRef);
        if (snapshot.exists()) {
          const post = snapshot.val();
          setPostData(post);
        }
      };
      fetchPost();
    }
  }, [postId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPostData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (selected, name) => { 
    setPostData((prevData) => ({
      ...prevData,
      [name]: selected.map(item => item.value),
    }));
  };
  
  const resetForm = () => {
    setPostData({
      TieuDe: "",
      TomTatNoiDung: "",
      TacGia: "",
      ThamVanYKhoa: "",
      CayThuocId: [],
      Image: "",
      NgayDang: "",
      Nguon: "",
    });
  };  

  const handleSaveToFirebase = async () => {
    try {
      const postRef = ref(database, 'Post');

      const snapshot = await get(postRef);
        let maxId = 0;
  
        if (snapshot.exists()) {
          const data = snapshot.val();
          Object.values(data).forEach((item) => {
            if (item.Id && item.Id > maxId) {
              maxId = item.Id;
            }
          });
        }
      
      if (postId) {
        // Cập nhật bài viết nếu có postId
        const updatedPost = {
          Id: postData.Id,
          TieuDe: postData.TieuDe,
          TomTatNoiDung: postData.TomTatNoiDung,
          NgayDang: postData.NgayDang || new Date().toLocaleDateString('vi-VN'),
          Nguon: postData.Nguon,
          TacGia: postData.TacGia,
          ThamVanYKhoa: postData.ThamVanYKhoa,
          CayThuocId: postData.CayThuocId || [],
          Image: postData.Image
        };
  
        const postRefToUpdate = ref(database, `Post/${postData.Id - 1}`);
        await set(postRefToUpdate, updatedPost);
        alert("Bài viết đã được cập nhật!");
        resetForm();
        navigate("/admin/posts");
      } else {
        // Thêm bài viết mới nếu không có postId
        const newId = maxId + 1;
        const newPost = {
          Id: newId,
          TieuDe: postData.TieuDe,
          TomTatNoiDung: postData.TomTatNoiDung,
          NgayDang: postData.NgayDang || new Date().toLocaleDateString('vi-VN'),
          Nguon: postData.Nguon,
          TacGia: postData.TacGia,
          ThamVanYKhoa: postData.ThamVanYKhoa,
          CayThuocId: postData.CayThuocId,
          Image: postData.Image
        };
  
        const newPostRef = ref(database, `Post/${newId - 1}`);
        await set(newPostRef, newPost);
        alert("Bài viết đã được đăng!");
        resetForm();
        navigate("/admin/posts");
      }
    } catch (error) {
      console.error("Lỗi khi lưu bài viết:", error);
      alert("Có lỗi xảy ra khi lưu bài viết!");
    }
  };

  return (
    <div className="content">
      <Row>
        <Col md="12">
          <Card>
            <CardHeader>
              <Row>
                <Col md="9">
                    <CardTitle tag="h5">{postId ? "Chỉnh sửa bài viết" : "Đăng bài viết mới"}</CardTitle>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md="6">
                  <FormGroup>
                    <Label for="TieuDe">Tiêu đề</Label>
                    <Input
                      type="text"
                      id="TieuDe"
                      name="TieuDe"
                      value={postData.TieuDe}
                      onChange={handleInputChange}
                      placeholder="Nhập tiêu đề bài viết"
                    />
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label for="TacGia">Tác giả</Label>
                    <Input
                      type="text"
                      id="TacGia"
                      name="TacGia"
                      value={postData.TacGia}
                      onChange={handleInputChange}
                      placeholder="Tên tác giả bài viết"
                    />
                  </FormGroup>
                </Col>
              </Row>
  
              <Row>
                <Col md="6">
                  <FormGroup>
                    <Label for="ThamVanYKhoa">Tham vấn Y khoa</Label>
                    <Input
                      type="text"
                      id="ThamVanYKhoa"
                      name="ThamVanYKhoa"
                      value={postData.ThamVanYKhoa}
                      onChange={handleInputChange}
                      placeholder="Người tham vấn y khoa"
                    />
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label for="NgayDang">Ngày đăng</Label>
                    <Input
                      type="date"
                      id="NgayDang"
                      name="NgayDang"
                      value={postData.NgayDang}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                </Col>
              </Row>
  
              <Row>
                <Col md="12">
                  <FormGroup>
                    <Label for="TomTatNoiDung">Tóm tắt nội dung</Label>
                    <Input
                      type="textarea"
                      id="TomTatNoiDung"
                      name="TomTatNoiDung"
                      value={postData.TomTatNoiDung}
                      onChange={handleInputChange}
                      placeholder="Nhập tóm tắt nội dung bài viết"
                      rows={5}
                    />
                  </FormGroup>
                </Col>
              </Row>
  
              <Row>
                <Col md="6">
                  <FormGroup>
                    <Label for="Image">Hình ảnh</Label>
                    <Input
                      type="url"
                      id="Image"
                      name="Image"
                      value={postData.Image}
                      onChange={handleInputChange}
                      placeholder="URL hình ảnh bài viết"
                    />
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label for="Nguon">Nguồn</Label>
                    <Input
                      type="url"
                      id="Nguon"
                      name="Nguon"
                      value={postData.Nguon}
                      onChange={handleInputChange}
                      placeholder="Link nguồn bài viết"
                    />
                  </FormGroup>
                </Col>
              </Row>
  
              <Row>
                <Col md="12">
                  <FormGroup>
                    <Label for="CayThuocId">Cây thuốc liên quan</Label>
                    <Select
                        isMulti
                        name="CayThuocId"
                        value={cayThuocList.filter(option => Array.isArray(postData.CayThuocId) && postData.CayThuocId.includes(option.value))}
                        options={cayThuocList}
                        onChange={(selected) => handleSelectChange(selected, 'CayThuocId')}
                    />

                  </FormGroup>
                </Col>
              </Row>
  
              <Row>
                <Col className="text-center">
                  <Button color="primary" onClick={handleSaveToFirebase}>
                        {postId ? "Cập nhật bài viết" : "Đăng bài viết"}
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );  
}

export default Post;
