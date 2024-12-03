
import { getAuth } from "firebase/auth";
import { get, ref, update } from "firebase/database";
import React, { useEffect, useState } from "react";

// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  FormGroup,
  Form,
  Input,
  Row,
  Col,
} from "reactstrap";
import { database } from '../firebase/firebase';

function User() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({});
  const [updateStatus, setUpdateStatus] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser; // Lấy người dùng đã đăng nhập

    if (user) {
      // Lấy thông tin người dùng từ Firebase Realtime Database
      const userRef = ref(database, 'Users/' + user.uid);
      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            setUserData(data);
            setFormData({
              full_name: data.full_name || '',
              email: data.email || '',
              phoneNumber: data.phoneNumber || '',
            });
          } else {
            setError("Không tìm thấy thông tin người dùng!");
          }
        })
        .catch((error) => {
          setError("Đã có lỗi xảy ra khi tải thông tin người dùng.");
        });
    } else {
      setError("Bạn chưa đăng nhập.");
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const userRef = ref(database, 'Users/' + user.uid);

      update(userRef, {
        full_name: formData.full_name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      })
        .then(() => {
          setUpdateStatus('Cập nhật thành công!');
        })
        .catch(() => {
          setUpdateStatus('Cập nhật thất bại.');
        });
    }
  };

  return (
    <>
      <div className="content">
        <Row>
          <Col md="4">
            <Card className="card-user">
              <div className="image">
                <img alt="..." src={require("assets/img/damir-bosnjak.jpg")} />
              </div>
              <CardBody>
                {userData ? (
                    <div className="author">
                    <a href="#pablo" onClick={(e) => e.preventDefault()}>
                      <img
                        alt="..."
                        className="avatar border-gray"
                        src={userData.image_user}
                      />
                      <h5 className="title">{userData.full_name}</h5>
                    </a>
                    <p className="description">{userData.email}</p>
                  </div>
                ): (
                  <p>{error}</p>
                )}
                
              </CardBody>
              <CardFooter>
                <hr />
                <div className="button-container">
                  <Row>
                    <Col className="ml-auto" lg="3" md="6" xs="6">
                      <h5>
                        10 <br />
                        <small>Đẹp trai</small>
                      </h5>
                    </Col>
                    <Col className="ml-auto mr-auto" lg="4" md="6" xs="6">
                      <h5>
                        10 <br />
                        <small>Zui tính</small>
                      </h5>
                    </Col>
                    <Col className="mr-auto" lg="3">
                      <h5>
                        10 <br />
                        <small>Giàu</small>
                      </h5>
                    </Col>
                  </Row>
                </div>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle tag="h4">Team Members</CardTitle>
              </CardHeader>
              <CardBody>
                {userData ? (
                    <ul className="list-unstyled team-members">
                    <li>
                      <Row>
                        <Col md="2" xs="2">
                          <div className="avatar">
                            <img
                              alt="..."
                              className="img-circle img-no-padding img-responsive"
                              src={userData.image_user}
                            />
                          </div>
                        </Col>
                        <Col md="7" xs="7">
                          {userData.username} <br />
                          <span className="text-muted">
                            <small>Offline</small>
                          </span>
                        </Col>
                        <Col className="text-right" md="3" xs="3">
                          <Button
                            className="btn-round btn-icon"
                            color="success"
                            outline
                            size="sm"
                          >
                            <i className="fa fa-envelope" />
                          </Button>
                        </Col>
                      </Row>
                    </li>
                    <li>
                      <Row>
                        <Col md="2" xs="2">
                          <div className="avatar">
                            <img
                              alt="..."
                              className="img-circle img-no-padding img-responsive"
                              src={require("assets/img/faces/joe-gardner-2.jpg")}
                            />
                          </div>
                        </Col>
                        <Col md="7" xs="7">
                          Nguyễn Quốc Khánh <br />
                          <span className="text-success">
                            <small>Available</small>
                          </span>
                        </Col>
                        <Col className="text-right" md="3" xs="3">
                          <Button
                            className="btn-round btn-icon"
                            color="success"
                            outline
                            size="sm"
                          >
                            <i className="fa fa-envelope" />
                          </Button>
                        </Col>
                      </Row>
                    </li>
                    <li>
                      <Row>
                        <Col md="2" xs="2">
                          <div className="avatar">
                            <img
                              alt="..."
                              className="img-circle img-no-padding img-responsive"
                              src={require("assets/img/faces/clem-onojeghuo-2.jpg")}
                            />
                          </div>
                        </Col>
                        <Col className="col-ms-7" xs="7">
                          Trần Việt Phúc <br />
                          <span className="text-danger">
                            <small>Busy</small>
                          </span>
                        </Col>
                        <Col className="text-right" md="3" xs="3">
                          <Button
                            className="btn-round btn-icon"
                            color="success"
                            outline
                            size="sm"
                          >
                            <i className="fa fa-envelope" />
                          </Button>
                        </Col>
                      </Row>
                    </li>
                  </ul>
                ) : (
                  <p>{error}</p>
                )}
              </CardBody>
            </Card>
          </Col>
          <Col md="8">
            <Card className="card-user">
              <CardHeader>
                <CardTitle tag="h5">Profile</CardTitle>
              </CardHeader>
              <CardBody onSubmit={handleUpdateProfile}>
                <Form>
                  <Row>
                    <Col className="pr-1" md="5">
                      <FormGroup>
                        <label>Trường</label>
                        <Input
                          defaultValue="Đại học Công Thương"
                          disabled
                          placeholder="Company"
                          type="text"
                        />
                      </FormGroup>
                    </Col>
                    <Col className="px-1" md="3">
                      <FormGroup>
                        <label>Họ & Tên</label>
                        <Input
                          name="full_name"
                          value={formData.full_name || ''}
                          onChange={handleInputChange}
                          placeholder="Họ & Tên"
                          type="text"
                        />
                      </FormGroup>
                    </Col>
                    <Col className="pl-1" md="4">
                      <FormGroup>
                        <label htmlFor="exampleInputEmail1">
                          Email
                        </label>
                        <Input  
                            name="email"
                            value={formData.email || ''}
                            onChange={handleInputChange}
                            placeholder="Email"
                            type="email" />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                      <FormGroup>
                        <label>Số điện thoại</label>
                        <Input
                           name="phoneNumber"
                           value={formData.phoneNumber || ''}
                           onChange={handleInputChange}
                           placeholder="Số điện thoại"
                           type="text"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                      <FormGroup>
                        <label>Về tôi</label>
                        <Input
                          type="textarea"
                          defaultValue="Anh chàng thư giãn ~~~~"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <div className="update ml-auto mr-auto">
                      <Button
                        className="btn-round"
                        color="primary"
                        type="submit"
                      >
                        Update Profile
                      </Button>
                    </div>
                  </Row>
                  {updateStatus && (
                    <Row>
                      <Col md="12">
                        <p style={{ color: updateStatus === 'Cập nhật thành công!' ? 'green' : 'red' }}>
                          {updateStatus}
                        </p>
                      </Col>
                    </Row>
                  )}
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default User;
