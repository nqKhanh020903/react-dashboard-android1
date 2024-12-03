import React, { useEffect, useState } from "react";
// react plugin used to create charts
import { Line, Pie } from "react-chartjs-2";
import { ref, onValue } from "firebase/database";
import { auth, database } from '../firebase/firebase';  // Import các dịch vụ Firebase từ firebase.js
// reactstrap components
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Row,
  Col,
} from "reactstrap";

function Dashboard() {
  const [chartData, setChartData] = useState({
    labels: [],  // Danh sách các bộ phận
    datasets: [
      {
        label: "Số lượng cây thuốc",
        backgroundColor: "#6bd098",
        borderColor: "#6bd098",
        borderWidth: 1,
        data: [], // Ban đầu dữ liệu trống
      },
    ],
  });

  useEffect(() => {
    const fetchCayThuocData = () => {
      const cayThuocRef = ref(database, "CayThuoc"); // Đọc dữ liệu từ nhánh "CayThuoc"
      onValue(cayThuocRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const boPhanDungCount = {}; // Đếm số lượng cây theo bộ phận sử dụng

          Object.values(data).forEach((cayThuoc) => {
            if (cayThuoc.BoPhanDung) {
              cayThuoc.BoPhanDung.forEach((boPhan) => {
                if (boPhanDungCount[boPhan]) {
                  boPhanDungCount[boPhan] += 1;
                } else {
                  boPhanDungCount[boPhan] = 1;
                }
              });
            }
          });

          // Chuyển đối tượng boPhanDungCount thành mảng để vẽ biểu đồ
          const boPhanLabels = Object.keys(boPhanDungCount); // Danh sách các bộ phận
          const boPhanValues = Object.values(boPhanDungCount); // Số lượng cây ứng với mỗi bộ phận

          // Cập nhật dữ liệu biểu đồ
          setChartData({
            labels: boPhanLabels,  // Các bộ phận là nhãn trục X
            datasets: [
              {
                label: "Số lượng cây thuốc",
                backgroundColor: "#6bd098",
                borderColor: "#6bd098",
                borderWidth: 1,
                data: boPhanValues, // Dữ liệu số lượng cây
              },
            ],
          });
        }
      });
    };

    fetchCayThuocData();
  }, []);


  return (
    <>
      <div className="content">
        <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <CardTitle tag="h5">Số lượng cây thuốc theo bộ phận sử dụng</CardTitle>
                <p className="card-category">Biểu đồ số lượng cây thuốc trong từng bộ phận</p>
              </CardHeader>
              <CardBody>
                <Line
                  data={chartData} 
                  options={{ plugins: { legend: { display: false } } }}
                />
              </CardBody>
              <CardFooter>
                <hr />
                <div className="stats">
                  <i className="fa fa-history" /> Updated 3 minutes ago
                </div>
              </CardFooter>
            </Card>
          </Col>
        </Row>
        <Row>
        </Row>
      </div>
    </>
  );
}

export default Dashboard;
