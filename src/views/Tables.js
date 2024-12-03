import React, { useEffect, useState } from "react";

// reactstrap components
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Table,
  Row,
  Col,
  Input,
  Button,
} from "reactstrap";

import { ref, get, remove } from "firebase/database";
import { database } from '../firebase/firebase';
import { useNavigate } from "react-router-dom";

function Tables() {
  const navigate = useNavigate();
  const [cayThuocs, setCayThuocs] = useState([]);
  const [posts, setPosts] = useState([]);
  const [danhMucs, setDanhMucs] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);

  // Lấy danh sách thuốc từ Firebase Realtime Database
  useEffect(() => {
    const fetchCayThuocData = async () => {
      const cayThuocRef = ref(database, 'CayThuoc');
      const snapshot = await get(cayThuocRef);
      if (snapshot.exists()) {
        setCayThuocs(Object.values(snapshot.val()));
      } else {
        console.log('Không có dữ liệu thuốc');
      }
    };

    const fetchPostData = async () => {
      const postRef = ref(database, 'Post');
      const snapshot = await get(postRef);
      if (snapshot.exists()) {
        setPosts(Object.values(snapshot.val()));
        setFilteredPosts(Object.values(snapshot.val()));
      } else {
        console.log('Không có dữ liệu bài viết');
      }
    };

    const fetchDanhMucData = async () => {
      const danhMucRef = ref(database, 'DanhMuc');
      const snapshot = await get(danhMucRef);
      if (snapshot.exists()) {
        setDanhMucs(Object.values(snapshot.val()));
      } else {
        console.log('Không có dữ liệu danh mục');
      }
    };
  
    const fetchHashtagData = async () => {
      const hashtagRef = ref(database, 'HashTag');
      const snapshot = await get(hashtagRef);
      if (snapshot.exists()) {
        setHashtags(Object.values(snapshot.val()));
      } else {
        console.log('Không có dữ liệu hashtag');
      }
    };

    fetchDanhMucData();
    fetchHashtagData();
    fetchCayThuocData();
    fetchPostData();
  }, []);

  const handleEditPost = (id) => {
    navigate(`/admin/posts?id=${id}`);
  };
  const handleEditCayThuoc = (id) => {
    navigate(`/admin/Herb?id=${id}`);
  };

  const handleDeleteCayThuoc = async (thuoc) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa cây thuốc: ${thuoc.TenThuoc}?`)) {
      try {
        // Trừ đi 1 vì Firebase key bắt đầu từ 0
        const firebaseId = thuoc.Id - 1;
        const thuocRef = ref(database, `CayThuoc/${firebaseId}`);
        await remove(thuocRef);
  
        // Cập nhật lại danh sách hiển thị sau khi xóa
        setCayThuocs((prevThuocs) => prevThuocs.filter(item => item.Id !== thuoc.Id));
  
        alert("Xóa cây thuốc thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa cây thuốc:", error);
        alert("Xóa cây thuốc thất bại.");
      }
    }
  };
  const handleDeletePost = async (post) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài viết: ${post.TieuDe}?`)) {
      try {
        // Trừ đi 1 vì Firebase key bắt đầu từ 0
        const firebaseId = post.Id - 1;
        const postRef = ref(database, `Post/${firebaseId}`);
        await remove(postRef);
  
        // Cập nhật lại danh sách hiển thị sau khi xóa
        setFilteredPosts((prevPosts) => prevPosts.filter(item => item.Id !== post.Id));
  
        alert("Xóa cây thuốc thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa cây thuốc:", error);
        alert("Xóa cây thuốc thất bại.");
      }
    }
  };
  
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const handleSearch = () => {
    // Lọc bài viết dựa trên ngày bắt đầu và ngày kết thúc
    const filtered = posts.filter(post => {
      if (!startDate && !endDate) return true; // Nếu không có tìm kiếm ngày, trả về tất cả bài viết
      const postDate = post.NgayDang;
      if (startDate && endDate) {
        return postDate >= startDate && postDate <= endDate; // Lọc theo khoảng ngày
      }
      if (startDate) {
        return postDate >= startDate; // Lọc theo ngày bắt đầu
      }
      if (endDate) {
        return postDate <= endDate; // Lọc theo ngày kết thúc
      }
      return false;
    });
    setFilteredPosts(filtered); // Cập nhật lại danh sách bài viết đã lọc
  };

  return (
    <>
      <div className="content">
         {/* Bảng Danh Sách Thuốc */}
        <Row>
          <Col md="12">
          <Card>
              <CardHeader>
              <Row className="d-flex align-items-center">
                  <Col>
                    <CardTitle tag="h4">Danh sách bài thuốc</CardTitle>
                  </Col>
                  <Col className="d-flex justify-content-start mr-2">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={handleStartDateChange}
                      placeholder="Ngày bắt đầu"
                      className="mr-2"
                    />
                    <Input
                      type="date"
                      value={endDate}
                      onChange={handleEndDateChange}
                      placeholder="Ngày kết thúc"
                      className="mr-2"
                    />
                    <Button
                      color="primary"
                      onClick={handleSearch}
                    >
                      Tìm kiếm
                    </Button>
                  </Col>
              </Row>

              </CardHeader>
              <CardBody>
                  <Table responsive>
                    <thead className="text-primary">
                      <tr>
                        <th>Tên Bài Viết</th>
                        <th>Tác Giả</th>
                        <th>Ngày Đăng</th>
                        <th>Nguồn</th>
                        <th>Tùy chọn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPosts.map((post, index) => (
                        <tr key={index}>
                          <td>{post.TieuDe}</td>
                          <td>{post.TacGia}</td>
                          <td>{post.NgayDang}</td>
                          <td><a href={post.Nguon} target="_blank" rel="noopener noreferrer">Xem thêm</a></td>
                          <td>
                            <button
                              style={{
                                backgroundColor: 'green',
                                color: 'white',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '5px',
                                marginRight: '5px',
                              }}
                              onClick={() => handleEditPost(post.Id)}
                            >
                              Sửa
                            </button>
                            <button
                              style={{
                                backgroundColor: 'red',
                                color: 'white',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '5px',
                              }}
                              onClick={() => handleDeletePost(post)}
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
              </CardBody>
            </Card>
          </Col>
          {/* Bảng Danh Sách Bài Viết */}
          <Col md="12">
          <Card className="card-plain">
              <CardHeader>
                <CardTitle tag="h4">Danh sách cây thuốc</CardTitle>
              </CardHeader>
              <CardBody>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <Table>
                    <thead className="text-primary">
                      <tr>
                        <th>Tên Thuốc</th>
                        <th>Họ</th>
                        <th>Phần Dùng</th>
                        <th>Công Dụng</th>
                        <th>Cách dùng & Liều lượng</th>
                        <th style={{width: '150px'}}>Loại bộ phận dùng</th>
                        <th>Trị bệnh</th>
                        <th style={{width: '120px'}}>Tùy chọn</th>
                      </tr>
                    </thead>
                    <tbody>
                    {cayThuocs.map((thuoc, index) => {
                      const danhMucName = thuoc.DanhMucId
                      .map((danhmucid) => danhMucs.find((item) => item.Id === danhmucid)?.TenBoPhanDung || 'Không xác định')
                      .join(', ');
                      const hashtagNames = thuoc.HashTagId
                        .map((hashtagId) => hashtags.find((item) => item.Id === hashtagId)?.TenHashTag || 'Không xác định')
                        .join(', ');

                      return (
                        <tr key={index}>
                          <td>{thuoc.TenThuoc}</td>
                          <td>{thuoc.Ho}</td>
                          <td>{thuoc.BoPhanDung.join(', ')}</td>
                          <td>{thuoc.CongDung}</td>
                          <td>{thuoc.CachDungVaLieuLuong}</td>
                          <td>{danhMucName}</td> {/* Hiển thị tên Danh Mục */}
                          <td>{hashtagNames}</td> {/* Hiển thị tên Hashtag */}
                          <td>
                            <button
                              style={{
                                backgroundColor: 'green',
                                color: 'white',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '5px',
                                marginRight: '5px',
                              }}
                              onClick={() => handleEditCayThuoc(thuoc.Id)}
                            >
                              Sửa
                            </button>
                            <button
                              style={{
                                backgroundColor: 'red',
                                color: 'white',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '5px',
                              }}
                              onClick={() => handleDeleteCayThuoc(thuoc)}
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    </tbody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Tables;
