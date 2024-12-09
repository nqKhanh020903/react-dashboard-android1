import React, { useEffect, useState } from "react";
// react plugin used to create charts
import { Bar, Line, Pie } from "react-chartjs-2";
import { ref, onValue } from "firebase/database";
import { auth, database } from '../firebase/firebase';
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
  const [hoDetails, setHoDetails] = useState({});
  const [chartData, setChartData] = useState({
    labels: [],  // Danh sách các bộ phận
    datasets: [
      {
        label: "Số lượng cây thuốc",
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
        data: [],
      },
    ],
  });

  // State cho biểu đồ Bar
  const [barChartData, setBarChartData] = useState({
    labels: [], // Danh sách các họ thực vật
    datasets: [
      {
        label: "Số lượng cây thuốc",
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
        tension: 0.4,
        data: [],
      },
    ],
  });

  const [boPhanDetails, setBoPhanDetails] = useState({});

  useEffect(() => {
    const fetchCayThuocData = () => {
      const colors = [
        "#6bd098", "#f17e5d", "#fcc468", "#51cbce", "#9c27b0", "#ff8a65", 
        "#ffeb3b", "#4caf50", "#2196f3", "#00bcd4", "#ff9800", "#e91e63", 
        "#673ab7", "#3f51b5", "#9e9e9e", "#607d8b", "#8bc34a", "#cddc39", 
        "#795548", "#03a9f4", "#cdff7f", "#a2c9fc", "#ff5722", "#d32f2f"
      ];
      
      const cayThuocRef = ref(database, "CayThuoc");
      onValue(cayThuocRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const boPhanDungCount = {};
          const boPhanMap = {}; // Lưu danh sách cây thuốc theo bộ phận

          Object.values(data).forEach((cayThuoc) => {
            if (Array.isArray(cayThuoc.BoPhanDung)) {
              cayThuoc.BoPhanDung.forEach((boPhan) => {
                if (boPhanDungCount[boPhan]) {
                  boPhanDungCount[boPhan] += 1;
                  boPhanMap[boPhan].push(cayThuoc.TenThuoc || "Không tên");
                } else {
                  boPhanDungCount[boPhan] = 1;
                  boPhanMap[boPhan] = [cayThuoc.TenThuoc || "Không tên"];
                }
              });
            }
          });

          const boPhanLabels = Object.keys(boPhanDungCount); // Danh sách các bộ phận
          const boPhanValues = Object.values(boPhanDungCount); // Số lượng cây thuốc
          const datasetColors = boPhanLabels.map((_, index) => colors[index % colors.length]);

          setBoPhanDetails(boPhanMap); // Lưu chi tiết cây thuốc theo bộ phận
          setChartData({
            labels: boPhanLabels,
            datasets: [
              {
                label: "Số lượng cây thuốc",
                backgroundColor: datasetColors,
                borderColor: datasetColors,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                data: boPhanValues,
              },
            ],
          });
        }
      });
    };

    fetchCayThuocData();
  }, []);

  // Fetch dữ liệu cho biểu đồ Bar
  useEffect(() => {
    const fetchCayThuocBarData = () => {
      const colors = [
        "#6bd098", "#f17e5d", "#fcc468", "#51cbce", "#9c27b0", "#ff8a65", 
        "#ffeb3b", "#4caf50", "#2196f3", "#00bcd4", "#ff9800", "#e91e63", 
        "#673ab7", "#3f51b5", "#9e9e9e", "#607d8b", "#8bc34a", "#cddc39", 
        "#795548", "#03a9f4", "#cdff7f", "#a2c9fc", "#ff5722", "#d32f2f"
      ];
      const threshold = 3; // Ngưỡng nhóm "Khác"
      const cayThuocRef = ref(database, "CayThuoc");
      onValue(cayThuocRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const hoCount = {};
          const hoMap = {}; // Lưu danh sách cây thuốc theo họ
  
          // Đếm số lượng cây thuốc theo họ
          Object.values(data).forEach((cayThuoc) => {
            const ho = cayThuoc.Ho || "Không xác định"; // Xử lý nếu thiếu "Ho"
            const tenThuoc = cayThuoc.TenThuoc || "Không tên"; // Lấy tên cây thuốc
            if (hoCount[ho]) {
              hoCount[ho] += 1;
              hoMap[ho].push(tenThuoc); // Thêm cây thuốc vào danh sách của họ
            } else {
              hoCount[ho] = 1;
              hoMap[ho] = [tenThuoc]; // Tạo danh sách mới
            }
          });
  
          // Phân loại các họ thành phổ biến và nhóm "Khác"
          const hoPhobien = [];
          const hoKhac = [];
          let countKhac = 0;
          const hoKhacMap = []; // Lưu danh sách cây thuốc trong nhóm "Khác"
  
          Object.entries(hoCount).forEach(([ho, count]) => {
            if (count >= threshold) {
              hoPhobien.push({ ho, count });
            } else {
              hoKhac.push(ho);
              countKhac += count;
              hoKhacMap.push(...hoMap[ho]); // Gộp danh sách cây thuốc của họ nhỏ
            }
          });
  
          // Labels và dữ liệu cho biểu đồ
          const hoLabels = [...hoPhobien.map((item) => item.ho), "Khác"];
          const hoValues = [...hoPhobien.map((item) => item.count), countKhac];
          const datasetColors = hoLabels.map((_, index) => colors[index % colors.length]);
  
          // Cập nhật danh sách chi tiết cây thuốc
          const finalHoMap = {
            ...hoMap,
            Khác: hoKhacMap, // Gán danh sách cây thuốc cho nhóm "Khác"
          };
  
          setHoDetails(finalHoMap); // Lưu danh sách cây thuốc theo họ
          setBarChartData({
            labels: hoLabels,
            datasets: [
              {
                label: "Số lượng cây thuốc",
                backgroundColor: datasetColors,
                borderColor: datasetColors,
                borderWidth: 1,
                data: hoValues,
              },
            ],
          });
        }
      });
    };
  
    fetchCayThuocBarData();
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
              <Bar
                data={chartData}
                  options={{
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          const boPhan = context.label;
                          const danhSachCayThuoc = boPhanDetails[boPhan] || []; 
                          return [
                            `Tổng số: ${context.raw}`, // Tổng số cây thuốc
                            ...danhSachCayThuoc.map((ten) => `- ${ten}`),
                          ];
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: "Bộ phận sử dụng",
                      },
                    },
                    y: {
                      title: {
                        display: true,
                        text: "Số lượng cây thuốc",
                      },
                    },
                  },
                }}
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
        <Col md="12">
          <Card>
            <CardHeader>
              <CardTitle tag="h5">Số lượng cây thuốc theo họ thực vật</CardTitle>
              <p className="card-category">Biểu đồ số lượng cây thuốc được phân loại theo họ</p>
            </CardHeader>
            <CardBody>
              <Line
                data={barChartData}
                options={{
                  plugins: {
                    legend: { display: false},
                    tooltip: {
                      callbacks: {
                        label: function (context){
                          const ho = context.label;
                          const danhSachCayThuoc = hoDetails[ho] || [];
                          return [`Tổng số: ${context.raw}`, ...danhSachCayThuoc.map((ten) => `- ${ten}`)];
                        }
                      }
                    }
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: "Họ thực vật",
                      },
                    },
                    y: {
                      title: {
                        display: true,
                        text: "Số lượng cây thuốc",
                      },
                    },
                  },
                }}
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
      </div>
    </>
  );
}

export default Dashboard;
