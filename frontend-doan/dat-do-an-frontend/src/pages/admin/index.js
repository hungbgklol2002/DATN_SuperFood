import lich from '../../assest/images/lich.png'
import { useState, useEffect, useRef } from 'react'
import { getMethodByToken } from '../../services/request'
import { formatMoney } from '../../services/money'
import Chart from "chart.js/auto";

const HomeAdmin = () => {
    const [doanhthu, setDoanhThu] = useState(0);
    const [quantri, setQt] = useState(null);
    const [doanhthuHomNay, setDoanhThuHomNay] = useState(0);
    const [donHoanThanhHomNay, setDonHoanThanhHomNay] = useState(0);
    const [items, setItems] = useState([]);  // Dữ liệu sản phẩm bán chạy
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Use state for selected year
    const chartRef = useRef(null); // Ref for chart

    const token = localStorage.getItem("token");

    useEffect(() => {
        // Fetch statistics
        const getThongKe = async () => {
            try {
                const [
                    revenueThisMonthRes,
                    revenueTodayRes,
                    numberAdminRes,
                    numberInvoiceTodayRes
                ] = await Promise.all([ 
                    getMethodByToken("http://localhost:8080/api/statistic/admin/revenue-this-month"),
                    getMethodByToken("http://localhost:8080/api/statistic/admin/revenue-today"),
                    getMethodByToken("http://localhost:8080/api/statistic/admin/number-admin"),
                    getMethodByToken("http://localhost:8080/api/statistic/admin/number-invoice-today-finish")
                ]);

                const revenueThisMonth = await revenueThisMonthRes.text();
                const revenueToday = await revenueTodayRes.text();
                const numberAdmin = await numberAdminRes.text();
                const numberInvoiceToday = await numberInvoiceTodayRes.text();

                setDoanhThu(revenueThisMonth);
                setDoanhThuHomNay(revenueToday);
                setQt(numberAdmin);
                setDonHoanThanhHomNay(numberInvoiceToday);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        getThongKe();

        // Fetch sản phẩm bán chạy
        const getProductBanChay = async () => {
            try {
                const response = await getMethodByToken('http://localhost:8080/api/product/public/san-pham-ban-chay');
                const list = await response.json();

                console.log("Fetched product list:", list);

                if (Array.isArray(list)) {
                    setItems(list);
                } else {
                    console.error("Dữ liệu không phải mảng:", list);
                    setItems([]); // Set mảng rỗng nếu dữ liệu không hợp lệ
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                setItems([]); // Set mảng rỗng nếu có lỗi
            }
        };
        
        getProductBanChay(); // Gọi hàm lấy sản phẩm bán chạy

    }, []);  // Run only once when component mounts

    useEffect(() => {
        // Update chart when data changes
        if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            let chartStatus = Chart.getChart(ctx);

            if (chartStatus) {
                chartStatus.destroy(); // Destroy previous chart if it exists
            }

            revenueYear(selectedYear, ctx);
        }
    }, [selectedYear]); // Re-run when selected year changes

    const revenueYear = async (year, ctx) => {
        try {
            const response = await fetch(`http://localhost:8080/api/statistic/admin/revenue-year?year=${year}`, {
                method: 'GET',
                headers: new Headers({
                    'Authorization': `Bearer ${token}`
                })
            });
            const list = await response.json();

            // Replace null values with 0
            const formattedData = list.map(item => item === null ? 0 : item);

            const myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: [
                        "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
                        "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
                        "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
                    ],
                    datasets: [{
                        label: `Doanh thu năm ${year}`,
                        backgroundColor: 'rgba(161, 198, 247, 1)',
                        borderColor: 'rgb(47, 128, 237)',
                        data: formattedData,
                    }]
                },
                options: {
                    scales: {
                        y: {
                            ticks: {
                                callback: function (value) {
                                    return formatMoney(value);
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error("Error fetching yearly revenue:", error);
        }
    };

    const handleYearChange = (e) => {
        setSelectedYear(e.target.value);
    };

    const VND = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });

    return (
        <>
            <div className="row">
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left shadow h-100 py-2">
                        <span className="lbcard">Doanh thu tháng này</span>
                        <span className="solieudoanhthu">{formatMoney(doanhthu)}</span>
                    </div>
                </div>
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left shadow h-100 py-2">
                        <span className="lbcard">Doanh thu hôm nay</span>
                        <span className="solieudoanhthu">{formatMoney(doanhthuHomNay)}</span>
                    </div>
                </div>
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left shadow h-100 py-2">
                        <span className="lbcard">Số lượng quản trị</span>
                        <span className="solieudoanhthu">{quantri}</span>
                    </div>
                </div>
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left shadow h-100 py-2">
                        <span className="lbcard">Đơn hoàn thành hôm nay</span>
                        <span className="solieudoanhthu">{donHoanThanhHomNay}</span>
                    </div>
                </div>
            </div>

            <div>
                <div className="col-sm-12 header-sp-thongke row">
                    <div className="col-md-3">
                        <label className="lbbooking">Chọn năm cần xem</label>
                        <select
                            id="nams"
                            className="form-control"
                            value={selectedYear}
                            onChange={handleYearChange}
                        >
                            <option value="2023">2023</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                            <option value="2027">2027</option>
                            <option value="2028">2028</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="lbbooking whitespace" dangerouslySetInnerHTML={{ __html: '<span>&ThinSpace;</span>' }}></label>
                        <button onClick={() => revenueYear(selectedYear, chartRef.current.getContext('2d'))} className="btn btn-primary form-control"><i className="fa fa-filter"></i> Lọc</button>
                    </div>
                </div>
                <div className="col-sm-12 divtale">
                    <div className="card chart-container divtale">
                        <canvas id="chart" ref={chartRef}></canvas>
                    </div>
                </div>
            </div>

            <div className="tablediv">
                <div className="headertable">
                    <span className="lbtable">Danh sách sản phẩm bán chạy</span>
                </div>
                <div className="divcontenttable">
                    {Array.isArray(items) && items.length > 0 ? (
                        <table id="example" className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Ảnh bìa</th>
                                    <th>Tên sản phẩm</th>
                                    <th>Giá hiện tại</th>
                                    <th>Giá cũ</th>
                                    <th>Hạn sử dụng</th>
                                    <th>Số lượng bán</th>
                                    <th>Danh mục</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td><img src={item.imageBanner || ''} alt="Product" className="imgadmin" /></td>
                                        <td>{item.name}</td>
                                        <td>{formatMoney(item.price)}</td>
                                        <td>{formatMoney(item.oldPrice)}</td>
                                        <td>{item.expiry}</td>
                                        <td>{item.quantitySold}</td>
                                        <td>{item.category?.name || 'Chưa có danh mục'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>Không có sản phẩm bán chạy để hiển thị.</p>
                    )}
                </div>
            </div>
        </>
    );
}

export default HomeAdmin;
