import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, CardTitle, FormGroup, Input, Button, Row, Col, Table, Label, Nav, NavItem, NavLink, Spinner } from "reactstrap";
import { ref, get, set, remove } from "firebase/database";
import { database } from '../firebase/firebase';
import classnames from "classnames";

function Category() {
  const [categories, setCategories] = useState([]);
  const [diseases, setDiseases] = useState([]);  // New state for diseases
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newDiseaseName, setNewDiseaseName] = useState(''); // New state for disease name
  const [newDiseaseId, setNewDiseaseId] = useState(''); // New state for disease ID
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('1');  // '1' for "Thêm Danh Mục", '2' for "Danh Sách Danh Mục", '3' for "Thêm Bệnh", '4' for "Danh Sách Bệnh"
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingDisease, setEditingDisease] = useState(null); // New state for editing disease
  
  const categoryRef = ref(database, 'DanhMuc');  // Firebase Realtime Database reference for categories
  const diseaseRef = ref(database, 'HashTag'); // Firebase Realtime Database reference for diseases

  // Toggle tab
  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  // Fetch categories and diseases from Firebase Realtime Database
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const categorySnapshot = await get(categoryRef);
        if (categorySnapshot.exists()) {
          setCategories(Object.values(categorySnapshot.val()));
        }

        const diseaseSnapshot = await get(diseaseRef);
        if (diseaseSnapshot.exists()) {
          setDiseases(Object.values(diseaseSnapshot.val()));
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle adding a new category
  const handleAddCategory = async () => {
    try {
      const snapshot = await get(categoryRef);
      let maxId = 0;

      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.values(data).forEach((item) => {
          if (item.Id && item.Id > maxId) {
            maxId = item.Id;
          }
        });
      }

      if (editingCategory) {
        const updatedCategory = {
          Id: editingCategory.Id,
          TenBoPhanDung: newCategoryName,
        };
        const categoryRefToUpdate = ref(database, `DanhMuc/${editingCategory.Id - 1}`);
        await set(categoryRefToUpdate, updatedCategory);
        alert('Danh mục đã được cập nhật!');
      } else {
        const newId = maxId + 1;
        const newCategory = {
          Id: newId,
          TenBoPhanDung: newCategoryName,
        };
        const newCategoryRef = ref(database, `DanhMuc/${newId - 1}`);
        await set(newCategoryRef, newCategory);
        alert('Danh mục mới đã được thêm!');
      }

      const updatedSnapshot = await get(categoryRef);
      setCategories(updatedSnapshot.exists() ? Object.values(updatedSnapshot.val()) : []);

      setNewCategoryId('');
      setNewCategoryName('');
      setEditingCategory(null);
    } catch (error) {
      console.error('Lỗi khi lưu danh mục:', error);
      alert('Có lỗi xảy ra khi lưu danh mục!');
    }
  };

  const handleDeleteCategory = async (category) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục: ${category.TenBoPhanDung}?`)) {
      try {
        const firebaseId = category.Id - 1;
        const categoryRefToDelete = ref(database, `DanhMuc/${firebaseId}`);
        await remove(categoryRefToDelete);

        setCategories((prevCategories) => prevCategories.filter(item => item.Id !== category.Id));

        alert("Xóa danh mục thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa danh mục:", error);
        alert("Xóa danh mục thất bại.");
      }
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category); 
    setNewCategoryId(category.Id);
    setNewCategoryName(category.TenBoPhanDung);
    setActiveTab('1');
  };

  // Handle adding a new disease
  const handleAddDisease = async () => {
    try {
      const snapshot = await get(diseaseRef);
      let maxId = 0;

      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.values(data).forEach((item) => {
          if (item.Id && item.Id > maxId) {
            maxId = item.Id;
          }
        });
      }

      if (editingDisease) {
        const updatedDisease = {
          Id: editingDisease.Id,
          TenHashTag: newDiseaseName,
        };
        const diseaseRefToUpdate = ref(database, `HashTag/${editingDisease.Id - 1}`);
        await set(diseaseRefToUpdate, updatedDisease);
        alert('Bệnh đã được cập nhật!');
      } else {
        const newId = maxId + 1;
        const newDisease = {
          Id: newId,
          TenHashTag: newDiseaseName,
        };
        const newDiseaseRef = ref(database, `HashTag/${newId - 1}`);
        await set(newDiseaseRef, newDisease);
        alert('Bệnh mới đã được thêm!');
      }

      const updatedSnapshot = await get(diseaseRef);
      setDiseases(updatedSnapshot.exists() ? Object.values(updatedSnapshot.val()) : []);

      setNewDiseaseId('');
      setNewDiseaseName('');
      setEditingDisease(null);
    } catch (error) {
      console.error('Lỗi khi lưu bệnh:', error);
      alert('Có lỗi xảy ra khi lưu bệnh!');
    }
  };

  const handleDeleteDisease = async (disease) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bệnh: ${disease.TenHashTag}?`)) {
      try {
        const firebaseId = disease.Id - 1;
        const diseaseRefToDelete = ref(database, `HashTag/${firebaseId}`);
        await remove(diseaseRefToDelete);

        setDiseases((prevDiseases) => prevDiseases.filter(item => item.Id !== disease.Id));

        alert("Xóa bệnh thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa bệnh:", error);
        alert("Xóa bệnh thất bại.");
      }
    }
  };

  const handleEditDisease = (disease) => {
    setEditingDisease(disease);
    setNewDiseaseId(disease.Id);
    setNewDiseaseName(disease.TenHashTag);
    setActiveTab('3');
  };

  return (
    <div className="content">
      <Row>
        <Col md="12">
          <Card>
            <CardHeader>
              <Row>
                <Col md="10">
                  <CardTitle tag="h5">
                    {activeTab === '1' ? "Thêm Danh Mục" :
                     activeTab === '3' ? "Thêm Bệnh" :
                     activeTab === '2' ? "Danh Sách Danh Mục" : "Danh Sách Bệnh"}
                  </CardTitle>
                </Col>
                <Col md="2" className="d-flex align-items-end">
                {(activeTab === '1' || activeTab === '3') && (
                    <Button color="primary" onClick={activeTab === '1' ? handleAddCategory : handleAddDisease} style={{ width: "100%" }}>
                      {activeTab === '1' ? (editingCategory ? 'Cập Nhật Danh Mục' : 'Thêm Danh Mục') :
                       activeTab === '3' ? (editingDisease ? 'Cập Nhật Bệnh' : 'Thêm Bệnh') : ''}
                    </Button>
                  )}
                </Col>
              </Row>
              {/* Tab Navigation */}
              <Nav tabs>
                <NavItem>
                  <NavLink
                    style={{cursor: "pointer"}}
                    className={classnames({ active: activeTab === '1' })}
                    onClick={() => toggleTab('1')}
                  >
                    Thêm Danh Mục
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    style={{cursor: "pointer"}}
                    className={classnames({ active: activeTab === '2' })}
                    onClick={() => toggleTab('2')}
                  >
                    Danh Sách Danh Mục
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    style={{cursor: "pointer"}}
                    className={classnames({ active: activeTab === '3' })}
                    onClick={() => toggleTab('3')}
                  >
                    Thêm Bệnh
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    style={{cursor: "pointer"}}
                    className={classnames({ active: activeTab === '4' })}
                    onClick={() => toggleTab('4')}
                  >
                    Danh Sách Bệnh
                  </NavLink>
                </NavItem>
              </Nav>
            </CardHeader>
            <CardBody>
              {/* Tab Content */}
              {activeTab === '1' ? (
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="categoryId">Mã Danh Mục</Label>
                      <Input
                        type="text"
                        id="categoryId"
                        name="categoryId"
                        value={newCategoryId}
                        onChange={(e) => setNewCategoryId(e.target.value)}
                        placeholder="Nhập mã danh mục"
                        disabled={editingCategory}
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label for="categoryName">Tên Danh Mục</Label>
                      <Input
                        type="text"
                        id="categoryName"
                        name="categoryName"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Nhập tên danh mục"
                      />
                    </FormGroup>
                  </Col>
                </Row>
              ) : activeTab === '2' ? (
                <Row>
                  <Col md="12">
                    {loading ? (
                      <Spinner color="primary" />
                    ) : (
                      <Table striped>
                        <thead>
                          <tr>
                            <th>STT</th>
                            <th>Mã Danh Mục</th>
                            <th>Tên Danh Mục</th>
                            <th>Tùy chọn</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map((category, index) => (
                            <tr key={category.Id}>
                              <td>{index + 1}</td>
                              <td>{category.Id}</td>
                              <td>{category.TenBoPhanDung}</td>
                              <td>
                                <Button color="warning" onClick={() => handleEditCategory(category)} style={{ marginRight: '5px' }}>
                                  Sửa
                                </Button>
                                <Button color="danger" onClick={() => handleDeleteCategory(category)}>
                                  Xóa
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </Col>
                </Row>
              ) : activeTab === '3' ? (
                <Row>
                  
                  <Col md="6">
                    <FormGroup>
                      <Label for="diseaseName">Tên Bệnh</Label>
                      <Input
                        type="text"
                        id="diseaseName"
                        name="diseaseName"
                        value={newDiseaseName}
                        onChange={(e) => setNewDiseaseName(e.target.value)}
                        placeholder="Nhập tên bệnh"
                      />
                    </FormGroup>
                  </Col>
                </Row>
              ) : (
                <Row>
                  <Col md="12">
                    {loading ? (
                      <Spinner color="primary" />
                    ) : (
                      <Table striped>
                        <thead>
                          <tr>
                            <th>STT</th>
                            <th>Mã Bệnh</th>
                            <th>Tên Bệnh</th>
                            <th>Tùy chọn</th>
                          </tr>
                        </thead>
                        <tbody>
                          {diseases.map((disease, index) => (
                            <tr key={disease.Id}>
                              <td>{index + 1}</td>
                              <td>{disease.Id}</td>
                              <td>{disease.TenHashTag}</td>
                              <td>
                                <Button color="warning" onClick={() => handleEditDisease(disease)} style={{ marginRight: '5px' }}>
                                  Sửa
                                </Button>
                                <Button color="danger" onClick={() => handleDeleteDisease(disease)}>
                                  Xóa
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </Col>
                </Row>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Category;
