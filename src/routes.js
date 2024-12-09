import Dashboard from "views/Dashboard.js";
import Herb from "views/Herb.js";
import TableList from "views/Tables.js";
import UserPage from "views/User.js";
import Login from "views/Login";
import Post from "views/Post";
import Category from "views/Category";
import ListUser from "views/ListUser";

var routes = [
  {
    path: "/dashboard",
    name: "Trang chủ",
    icon: "nc-icon nc-bank",
    component: <Dashboard />,
    layout: "/admin",
  },
  {
    path: "/Herb",
    name: "Quản lý cây thuốc",
    icon: "nc-icon nc-diamond",
    component: <Herb />,
    layout: "/admin",
  },
  {
    path: "/tables",
    name: "Danh sách thuốc",
    icon: "nc-icon nc-tile-56",
    component: <TableList />,
    layout: "/admin",
  },
  {
    path: "/posts",
    name: "Quản lý bài thuốc",
    icon: "nc-icon nc-tile-56",
    component: <Post />,
    layout: "/admin",
  },
  {
    path: "/category",
    name: "Quản lý danh mục",
    icon: "nc-icon nc-tile-56",
    component: <Category />,
    layout: "/admin",
  },
  {
    path: "/list-users",
    name: "Quản lý người dùng",
    icon: "nc-icon nc-tile-56",
    component: <ListUser />,
    layout: "/admin",
  },
  {
    path: "/user-page",
    name: "Thông tin người dùng",
    icon: "nc-icon nc-single-02",
    component: <UserPage />,
    layout: "/admin",
  },
  {
    pro: true,
    path: "/login",
    name: "Đăng Xuất",
    icon: "nc-icon nc-spaceship",
    component: <Login />,
    layout: "",
  },
];
export default routes;
