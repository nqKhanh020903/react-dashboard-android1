import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Card, CardHeader, CardBody, CardTitle, Row, Col, FormGroup, Label, Form, Input, Button } from "reactstrap";
import { database } from '../firebase/firebase';
import { ref, push, set, get } from "firebase/database";
import { useLocation, useNavigate } from "react-router-dom";

function Herb() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [danhMucOptions, setDanhMucOptions] = useState([]);
  const [hashTagOptions, setHashTagOptions] = useState([]);
  const [plantData, setPlantData] = useState({
    TenThuoc: '',
    TenKhoaHoc: '',
    CongDung: '',
    ThanhPhanHoaHocChinh: '',
    BoPhanDung: '',
    CachDungVaLieuLuong: '',
    Image: '',
    Ho: '',
    DanhMucId: [],
    HashTagId: [],
  });

  const plantId = parseInt(new URLSearchParams(window.location.search).get('id'), 10); // Chuyển thành số
  console.log("ID từ URL:", plantId);

   // Nếu có ID, gọi Firebase để lấy thông tin của cây thuốc
   useEffect(() => {
    const danhMucRef = ref(database, 'DanhMuc');
    get(danhMucRef).then((snapshot) => {
      if (snapshot.exists()) {
        const danhMucData = snapshot.val();
        const danhMucList = Object.values(danhMucData).map(item => ({
          value: item.Id,
          label: item.TenBoPhanDung,
        }));
        setDanhMucOptions(danhMucList);
      }
    });

    // Lấy hashtag
    const hashTagRef = ref(database, 'HashTag');
    get(hashTagRef).then((snapshot) => {
      if (snapshot.exists()) {
        const hashTagData = snapshot.val();
        const hashTagList = Object.values(hashTagData).map(item => ({
          value: item.Id,
          label: item.TenHashTag,
        }));
        setHashTagOptions(hashTagList);
      }
    });
    if (plantId) {
      const plantRef = ref(database, `CayThuoc/${plantId - 1}`);
      get(plantRef).then((snapshot) => {
        if (snapshot.exists()) {
          const plant = snapshot.val();
          setPlantData({
            TenThuoc: plant.TenThuoc || '',
            TenKhoaHoc: plant.TenKhoaHoc || '',
            CongDung: plant.CongDung || '',
            ThanhPhanHoaHocChinh: (plant.ThanhPhanHoaHocChinh || []).join(','),
            BoPhanDung: (plant.BoPhanDung || []).join(','),
            CachDungVaLieuLuong: plant.CachDungVaLieuLuong || '',
            Image: (plant.Image || []).map((image) => image.ImagePath).join(','),
            Ho: plant.Ho || '',
            DanhMucId: plant.DanhMucId || [],
            HashTagId: plant.HashTagId || [],
          });
        } else {
          alert("Không tìm thấy cây thuốc.");
        }
      });
    }
  }, [plantId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlantData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };  

  const handleSelectChange = (selected, name) => {
    setPlantData((prevData) => ({
      ...prevData,
      [name]: selected.map(item => item.value),
    }));
  };

  const handleSaveToFirebase = async () => {
    try {
      const cayThuocRef = ref(database, 'CayThuoc');
      
      // Lấy toàn bộ danh sách cây thuốc để xác định ID lớn nhất
      const snapshot = await get(cayThuocRef);
      let maxId = 0;
  
      if (snapshot.exists()) {
        const data = snapshot.val();
  
        // Duyệt qua các cây thuốc để tìm ID lớn nhất
        Object.values(data).forEach((item) => {
          if (item.Id && item.Id > maxId) {
            maxId = item.Id;
          }
        });
      }
  
      const newId = maxId + 1;
      
      const images = plantData.Image.split(',').map((image, index) => ({
        Id: index + 1, // Tạo ID tự động
        ImagePath: image
      }));
      if (plantId) {
        // Nếu có ID, cập nhật cây thuốc
        const plantRef = ref(database, `CayThuoc/${plantId - 1}`);
        await set(plantRef, {
          TenThuoc: plantData.TenThuoc,
          TenKhoaHoc: plantData.TenKhoaHoc,
          CongDung: plantData.CongDung,
          ThanhPhanHoaHocChinh: plantData.ThanhPhanHoaHocChinh.split(','),
          BoPhanDung: plantData.BoPhanDung.split(','),
          CachDungVaLieuLuong: plantData.CachDungVaLieuLuong,
          Image: images,
          Ho: plantData.Ho,
          DanhMucId: plantData.DanhMucId,
          HashTagId: plantData.HashTagId,
        });
        alert("Cập nhật thông tin cây thuốc thành công!");
      } else {
        // Nếu không có ID, thêm mới cây thuốc
        const newPlantRef = ref(database, `CayThuoc/${maxId}`);
        await set(newPlantRef, {
          Id: maxId + 1,
          TenThuoc: plantData.TenThuoc,
          TenKhoaHoc: plantData.TenKhoaHoc,
          CongDung: plantData.CongDung,
          ThanhPhanHoaHocChinh: plantData.ThanhPhanHoaHocChinh.split(','),
          BoPhanDung: plantData.BoPhanDung.split(','),
          CachDungVaLieuLuong: plantData.CachDungVaLieuLuong,
          Image: images,
          Ho: plantData.Ho,
          DanhMucId: plantData.DanhMucId,
          HashTagId: plantData.HashTagId,
        });
        alert("Thêm thông tin cây thuốc thành công!");
      }
  
      // Reset form sau khi lưu dữ liệu
      setPlantData({
        TenThuoc: '',
        TenKhoaHoc: '',
        CongDung: '',
        ThanhPhanHoaHocChinh: '',
        BoPhanDung: '',
        CachDungVaLieuLuong: '',
        Image: '',
        Ho: '',
        DanhMucId: [],
        HashTagId: [],
      });
  
      // Điều hướng về trang trước đó
      navigate('/admin/tables');
    } catch (error) {
      console.error("Lỗi khi thêm hoặc sửa dữ liệu vào Firebase: ", error);
      alert("Có lỗi xảy ra khi thêm hoặc sửa dữ liệu!");
    }
  };  
  
  return (
    <>
      <div className="content">
        <Row>
          <Col md="12">
            <Card className="demo-icons">
              <CardHeader>
                  <Row>
                    <Col md="9">
                      <CardTitle tag="h5">{plantId ? 'Cập nhật thông tin cây thuốc' : 'Thêm thông tin cây thuốc'}</CardTitle>
                    </Col>
                    <Col md="3" className="d-flex justify-content-end align-items-center">
                      <Button
                        color="success"
                        onClick={handleSaveToFirebase}
                      >
                        {plantId ? 'Cập nhật' : 'Thêm'}
                      </Button>
                    </Col>
                  </Row>
                </CardHeader>
              <CardBody className="all-icons">
                <Form>
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label for="name">Tên cây thuốc</Label>
                        <Input
                          type="text"
                          id="TenThuoc"
                          name="TenThuoc"
                          value={plantData.TenThuoc}
                          onChange={handleInputChange}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label for="TenKhoaHoc">Tên khoa học</Label>
                        <Input
                          type="text"
                          id="TenKhoaHoc"
                          name="TenKhoaHoc"
                          value={plantData.TenKhoaHoc}
                          onChange={handleInputChange}
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  {/* Row 2 - 3 Inputs */}
                  <Row>
                    <Col md="4">
                      <FormGroup>
                        <Label for="uses">Họ</Label>
                        <Input
                          type="text"
                          id="Ho"
                          name="Ho"
                          value={plantData.Ho}
                          onChange={handleInputChange}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="4">
                      <FormGroup>
                        <Label for="components">Thành phần hóa học chính</Label>
                        <Input
                          type="text"
                          id="ThanhPhanHoaHocChinh"
                          name="ThanhPhanHoaHocChinh"
                          value={plantData.ThanhPhanHoaHocChinh}
                          onChange={handleInputChange}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="4">
                      <FormGroup>
                        <Label for="dosage">Bộ phận dùng</Label>
                        <Input
                          type="text"
                          id="BoPhanDung"
                          name="BoPhanDung"
                          value={plantData.BoPhanDung}
                          onChange={handleInputChange}
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  {/* Row 3 - 2 Inputs */}
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label for="notes">Công dụng</Label>
                        <Input
                          type="text"
                          id="CongDung"
                          name="CongDung"
                          value={plantData.CongDung}
                          onChange={handleInputChange}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label for="image">Hình ảnh</Label>
                       
                        <Input
                          type="text"
                          id="Image"
                          name="Image"
                          value={plantData.Image}
                          onChange={handleInputChange}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="4">
                      <FormGroup>
                        <Label for="additionalNotes">Cách dùng & Liều luọng</Label>
                        <Input
                          type="text"
                          id="CachDungVaLieuLuong"
                          name="CachDungVaLieuLuong"
                          value={plantData.CachDungVaLieuLuong}
                          onChange={handleInputChange}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="4">
                      <FormGroup>
                        <Label for="DanhMucId">Bộ phận dùng</Label>
                        <Select
                          isMulti
                          name="DanhMucId"
                          value={danhMucOptions.filter(option => plantData.DanhMucId.includes(option.value))}
                          options={danhMucOptions}
                          onChange={(selected) => handleSelectChange(selected, 'DanhMucId')}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="4">
                      <FormGroup>
                        <Label for="HashTagId">Trị bệnh</Label>
                        <Select
                          isMulti
                          name="HashTagId"
                          value={hashTagOptions.filter(option => plantData.HashTagId.includes(option.value))}
                          options={hashTagOptions}
                          onChange={(selected) => handleSelectChange(selected, 'HashTagId')}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Herb;
