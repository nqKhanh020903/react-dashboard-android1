import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Button,
  Row,
  Col,
  Table,
  Nav,
  NavItem,
  NavLink,
  Spinner,
  FormGroup,
  Input,
  Label
} from "reactstrap";
import { ref, get, set, remove } from "firebase/database";
import { database } from "../firebase/firebase";
import classnames from "classnames";

function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState({}); // Lưu vai trò dưới dạng {role_id: role_name}
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("2"); // Default tab is "Danh Sách Người Dùng"
  const [editingUser, setEditingUser] = useState(null);

  const usersRef = ref(database, "Users");
  const rolesRef = ref(database, "Role"); // Tham chiếu đến Role

  // Fetch users and roles from Firebase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy danh sách người dùng
        const usersSnapshot = await get(usersRef);
        if (usersSnapshot.exists()) {
          const data = usersSnapshot.val();
          const userList = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setUsers(userList);
        } else {
          console.log("Không có dữ liệu người dùng");
        }

        // Lấy danh sách vai trò
        const rolesSnapshot = await get(rolesRef);
        if (rolesSnapshot.exists()) {
          const data = rolesSnapshot.val();
          const rolesMap = Object.keys(data).reduce((acc, key) => {
            acc[key] = data[key].role_name; // Ánh xạ role_id thành role_name
            return acc;
          }, {});
          setRoles(rolesMap);
        } else {
          console.log("Không có dữ liệu vai trò");
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Toggle tab
  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  // Handle saving edited user
  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        const userRef = ref(database, `Users/${editingUser.id}`);
        await set(userRef, editingUser);
        alert("Thông tin người dùng đã được cập nhật!");

        // Update user list
        const snapshot = await get(usersRef);
        setUsers(
          snapshot.exists()
            ? Object.keys(snapshot.val()).map((key) => ({
                id: key,
                ...snapshot.val()[key],
              }))
            : []
        );

        setEditingUser(null); // Exit edit mode
        setActiveTab("2");
      }
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Có lỗi xảy ra khi cập nhật thông tin người dùng!");
    }
  };

  // Handle deleting a user
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        const userRef = ref(database, `Users/${userId}`);
        await remove(userRef);
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        alert("Xóa người dùng thành công!");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Có lỗi xảy ra khi xóa người dùng!");
      }
    }
  };

  // Handle editing a user
  const handleEditUser = (user) => {
    setEditingUser(user);
    setActiveTab("1");
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
                    {activeTab === "1"
                      ? "Chỉnh Sửa Người Dùng"
                      : "Danh Sách Người Dùng"}
                  </CardTitle>
                </Col>
              </Row>
              <Nav tabs>
                <NavItem>
                  <NavLink
                    style={{ cursor: "pointer" }}
                    className={classnames({ active: activeTab === "2" })}
                    onClick={() => toggleTab("2")}
                  >
                    Danh Sách Người Dùng
                  </NavLink>
                </NavItem>
              </Nav>
            </CardHeader>
            <CardBody>
              {activeTab === "1" && editingUser ? (
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="username">Tên Người Dùng</Label>
                      <Input
                        type="text"
                        id="username"
                        value={editingUser.username || ""}
                        onChange={(e) =>
                          setEditingUser({
                            ...editingUser,
                            username: e.target.value,
                          })
                        }
                        placeholder="Tên người dùng"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label for="id_role">Vai Trò</Label>
                      <Input
                        type="select"
                        id="id_role"
                        value={editingUser.id_role || ""}
                        onChange={(e) =>
                          setEditingUser({
                            ...editingUser,
                            id_role: e.target.value,
                          })
                        }
                      >
                        {Object.entries(roles).map(([roleId, roleName]) => (
                          <option key={roleId} value={roleId}>
                            {roleName}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label for="is_active">Trạng Thái</Label>
                      <Input
                        type="select"
                        id="is_active"
                        value={editingUser.is_active ? "1" : "0"}
                        onChange={(e) =>
                          setEditingUser({
                            ...editingUser,
                            is_active: e.target.value === "1",
                          })
                        }
                      >
                        <option value="1">Kích Hoạt</option>
                        <option value="0">Vô Hiệu</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md="12" className="text-center">
                    <Button color="primary" onClick={handleSaveUser}>
                      Lưu Thay Đổi
                    </Button>
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
                            <th>#</th>
                            <th>Tên</th>
                            <th>Email</th>
                            <th>Vai Trò</th>
                            <th>Trạng Thái</th>
                            <th>Hành Động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user, index) => (
                            <tr key={user.id}>
                              <td>{index + 1}</td>
                              <td>{user.username}</td>
                              <td>{user.email}</td>
                              <td>{roles[user.id_role] || "N/A"}</td> {/* Hiển thị role_name */}
                              <td>{user.is_active ? "Kích Hoạt" : "Vô Hiệu"}</td>
                              <td>
                                <Button
                                  color="warning"
                                  onClick={() => handleEditUser(user)}
                                  style={{ marginRight: "5px" }}
                                >
                                  Sửa
                                </Button>
                                <Button
                                  color="danger"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
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

export default Users;
