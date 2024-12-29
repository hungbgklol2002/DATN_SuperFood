import { getMethod, getMethodByToken, getMethodDeleteByToken, getMethodPostByToken, getMethodPostPayload } from '../../services/request';
import { formatMoney } from '../../services/money';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import banner from '../../assest/images/banner2.jpg';
import momo from '../../assest/images/momo.webp';
import vnpayLogo from '../../assest/images/vnp.jpg'; 
import $ from 'jquery'; 
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
function PublicCart() {
    const [items, setItems] = useState([]);
    const [numCart, setNumCart] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [user, setUser] = useState(null);
    const [voucher, setVoucher] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        const getCart = async () => {
            initCart();
        };
        getCart();

        const getUser = async () => {
            var response = await getMethodByToken('http://localhost:8080/api/user/user-logged');
            var us = await response.json();
            setUser(us);
        };
        getUser();
    }, []);

    async function initCart() {
        var response = await getMethodByToken('http://localhost:8080/api/cart/user/my-cart');
        var list = await response.json();
        setItems(list);
        var num = 0;
        var total = 0;
        for (let i = 0; i < list.length; i++) {
            num += list[i].quantity;
            total += list[i].quantity * list[i].product.price;
        }
        setNumCart(num);
        setTotalAmount(total);  
    }
    async function deleteCart(id) {
        var con = window.confirm("Xóa sản phẩm khỏi giỏ hàng?");
        if (con == false) {
            return;
        }
        var response = await getMethodDeleteByToken('http://localhost:8080/api/cart/user/delete?id=' + id);
        if (response.status < 300) {
            toast.success("xóa thành công!");
            initCart();
        }
        if (response.status == 417) {
            var result = await response.json();
            toast.warning(result.defaultMessage);
        }
    }
    async function createInvoiceAfterVNPay() {
        const orderDto = {
            "payType": "VNPAY",
            "fullname": document.getElementById("fullname").value,
            "phone": document.getElementById("phone").value,
            "address": document.getElementById("diachinhan").value,
            "note": document.getElementById("ghichudonhang").value,
            "codeVoucher": voucher == null ? null : voucher.code,
        };
    
        try {
            const response = await getMethodPostPayload('http://localhost:8080/api/invoice/user/create', orderDto);
            if (response.status < 300) {
                Swal.fire({
                    title: "Thông báo",
                    text: "Đặt hàng thành công! Hóa đơn đã được tạo.",
                    icon: "success",
                    preConfirm: () => {
                    
                        window.location.href = '/';
                    }
                });
            } else {
                if (response.status === 417) {
                    const result = await response.json();
                    toast.error(result.defaultMessage);
                } else {
                    toast.error("Không thể tạo hóa đơn sau thanh toán VNPay");
                }
            }
        } catch (error) {
            toast.error("Hệ thống gặp lỗi, không thể tạo hóa đơn");
            console.error("Error:", error);
        }
    }
    async function upOrDownCart(id, quantity) {
        var response = await getMethodByToken('http://localhost:8080/api/cart/user/up-and-down-cart?id=' + id + '&quantity=' + quantity);
        initCart();
    }

    function checkout() {
        var con = window.confirm("Xác nhận đặt hàng!");
        if (con == false) {
            return;
        }
        var paytype = $('input[name=paytype]:checked').val();
        if (paytype === "momo") {
            requestPayMentMomo(); 
        } else if (paytype === "cod") {
            paymentCod(); 
        } else if (paytype === "vnpay") {
            requestPayMentVNPAY(); 
        }
    }


    async function requestPayMentMomo() {
        var orderDto = {
            "payType": "MOMO",
            "fullname": document.getElementById("fullname").value,
            "phone": document.getElementById("phone").value,
            "address": document.getElementById("diachinhan").value,
            "note": document.getElementById("ghichudonhang").value,
            "codeVoucher": voucher == null ? null : voucher.code,
        };
        window.localStorage.setItem('orderinfor', JSON.stringify(orderDto));
        var returnurl = 'http://localhost:3000/payment';
        var paymentDto = {
            "codeVoucher": voucher == null ? null : voucher.code,
            "content": "Đặt đồ ăn",
            "returnUrl": returnurl,
            "notifyUrl": returnurl,
        };
        var res = await getMethodPostPayload('http://localhost:8080/api/urlpayment', paymentDto);
        if (res.status < 300) {
            
            var result = await res.json();
            window.open(result.url, '_blank');
        } else {
            if (res.status === 417) {
                var result = await res.json();
                toast.error(result.defaultMessage);
            } else {
                toast.error("Momo đang gặp lỗi, không thể thanh toán");
            }
        }
    }

    async function paymentCod() {
        var orderDto = {
            "payType": "COD",
            "fullname": document.getElementById("fullname").value,
            "phone": document.getElementById("phone").value,
            "address": document.getElementById("diachinhan").value,
            "note": document.getElementById("ghichudonhang").value,
        };
        var res = await getMethodPostPayload('http://localhost:8080/api/invoice/user/create', orderDto);
        if (res.status < 300) {
            Swal.fire({
                title: "Thông báo",
                text: "Đặt hàng thành công!",
                preConfirm: () => {
                    window.location.href = 'account';
                }
            });
        } else {
            if (res.status === 417) {
                var result = await res.json();
                toast.error(result.defaultMessage);
            } else {
                toast.error("Đặt hàng thất bại");
            }
        }
    }

    async function requestPayMentVNPAY() {
        const params = new URLSearchParams({
            amount: totalAmount,
            fullname: document.getElementById("fullname").value,
            phone: document.getElementById("phone").value,
            address: document.getElementById("diachinhan").value,
            note: document.getElementById("ghichudonhang").value,
            codeVoucher: voucher ? voucher.code : null,
        });
    
        const url = `http://localhost:8080/vn-pay?${params.toString()}`;
    
        try {
            const response = await fetch(url, { method: "GET" });
            const result = await response.json();
    
            if (result.code === 200 && result.data.paymentUrl) {
                window.open(result.data.paymentUrl, "_self");
                await createInvoiceAfterVNPay();
                navigate("/success-payment"); 
            } else {
                toast.error("Lỗi khi khởi tạo thanh toán VNPay: " + result.message);
            }
        } catch (error) {
            toast.error("VNPay đang gặp lỗi, không thể thanh toán");
            console.error(error);
        }
    }
      function checkout() {
        const confirmCheckout = window.confirm("Xác nhận đặt hàng!");
        if (!confirmCheckout) return;
    
        const payType = document.querySelector("input[name=paytype]:checked").value;
    
        if (payType === "momo") {
            requestPayMentMomo();
        } else if (payType === "cod") {
            paymentCod();
        } else if (payType === "vnpay") {
            requestPayMentVNPAY();
        }
      }
    

    async function loadVoucher() {
        document.getElementById("tongtienthanhtoan").innerHTML = formatMoney(totalAmount);

        var code = document.getElementById("codevoucher").value;
        var url = 'http://localhost:8080/api/voucher/public/findByCode?code=' + code + '&amount=' + totalAmount;
        const response = await fetch(url, {});
        var result = await response.json();
        if (response.status < 300) {
            setVoucher(result);
            document.getElementById("blockmessErr").style.display = 'none';
            document.getElementById("blockmess").style.display = 'block';
            document.getElementById("tongtienthanhtoan").innerHTML = formatMoney(totalAmount - result.discount);
        } else {
            setVoucher(null);
            if (response.status === 417) {
                var mess = result.defaultMessage;
                document.getElementById("messerr").innerHTML = mess;
                document.getElementById("blockmessErr").style.display = 'block';
                document.getElementById("blockmess").style.display = 'none';
            }
        }
    }

    return (
        <>
            <div className='container'>
                <img src={banner} className='bannercart'/>
            </div>
            <div className="container divcart">
                <div className="row">
                    <div className="col-sm-8">
                        <div className='ttcart'>
                            <p className="tintuctieude">Giỏ hàng <span className="soluonggiohang">({numCart}) sản phẩm</span></p>
                            <hr />
                            <table className="table tablecart">
                                <tr>
                                    <th>Sản phẩm</th>
                                    <th>Đơn giá</th>
                                    <th>Số lượng</th>
                                    <th>Tổng tiền</th>
                                </tr>
                                <tbody id="listcartDes">
                                    {items.map((item, index) => {
                                        return <tr key={index}>
                                            <td>
                                                <a href=""><img className="imgprocart" src={item.product.imageBanner} alt=""/></a>
                                                <div className="divnamecart">
                                                    <a href="" className="nameprocart">{item.product.name}</a>
                                                </div>
                                            </td>
                                            <td>
                                                <p className="boldcart">{formatMoney(item.product.price)}</p>
                                            </td>
                                            <td>
                                                <div className="clusinp">
                                                    <button onClick={() => upOrDownCart(item.id, 1)} className="cartbtn"> + </button>
                                                    <input className="inputslcart" value={item.quantity} />
                                                    <button onClick={() => upOrDownCart(item.id, -1)} className="cartbtn"> - </button>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="tdpricecart">
                                                    <p className="boldcart">{formatMoney(item.product.price * item.quantity)}</p>
                                                    <p onClick={() => deleteCart(item.id)} className="delcart"><i className="fa fa-trash facartde"></i></p>
                                                </div>
                                            </td>
                                        </tr>
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="col-sm-4">
                        <div className="ttcart">
                            <div className="tongdon">
                                <span className="tds">Tổng đơn: </span><span className="tonggiatien" id="tonggiatien">{formatMoney(totalAmount)}</span>
                                <button data-bs-toggle="modal" data-bs-target="#exampleModal" className="btnthanhtoan">Thanh toán</button>
                            </div>
                            <p className="freeship">MIỄN PHÍ VẬN CHUYỂN VỚI MỌI ĐƠN HÀNG TRÊN WEBSITE</p>
                            <p>Mọi đơn hàng trên hệ thống sẽ được trừ thẳng vào sản phẩm sau khi nhận hàng</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Thanh toán đơn hàng</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-sm-6">
                                    <span className="titlecheckout">Thông tin giao hàng</span>
                                    <label className="lbcheckout">Họ tên người nhận</label>
                                    <input defaultValue={user == null ? '' : user.fullname} id="fullname" className="form-control fomd" placeholder="Họ tên" />

                                    <label className="lbcheckout">Số điện thoại người nhận</label>
                                    <input defaultValue={user == null ? '' : user.phone} id="phone" className="form-control fomd" placeholder="Số điện thoại" />

                                    <label className="lbcheckout">Địa chỉ người nhận</label>
                                    <input id="diachinhan" className="form-control fomd" placeholder="Tên đường, số nhà" />

                                    <label className="lbcheckout">Ghi chú nhận hàng</label>
                                    <textarea id="ghichudonhang" className="form-control fomd" placeholder="ghi chú"></textarea>
                                </div>
                                <div className="col-sm-6">
                                    <span className="titlecheckout">Loại hình thanh toán</span>
                                    <table className="table table-bordered">
                                        <tr onclick="momo.click()">
                                            <td><label className="radiocustom">
                                                    <input value="momo" id="momo" type="radio" name="paytype" checked />
                                                    <span className="checkmark"></span>
                                                </label></td>
                                            <td><label for="momo">Thanh toán qua Ví MoMo</label></td>
                                            <td><img src={momo} className="momopay" /></td>
                                        </tr>
                                        <tr onclick="vnpay.click()">
                                            <td><label className="radiocustom">
                                                    <input value="vnpay" id="vnpay" type="radio" name="paytype" />
                                                    <span className="checkmark"></span>
                                                </label></td>
                                            <td><label for="vnpay">Thanh toán qua VNPay</label></td>
                                            <td><img src={vnpayLogo} className="vnpaypay" /></td>
                                        </tr>

                                        <tr onclick="code.click()">
                                            <td><label className="radiocustom">
                                                    <input value="cod" id="code" type="radio" name="paytype" />
                                                    <span className="checkmark"></span>
                                                </label></td>
                                            <td><label for="code">Thanh toán khi nhận hàng (COD)</label></td>
                                            <td><i className="fa fa-money paycode"></i></td>
                                        </tr>
                                    </table>
                                    <div className="row magg">
                                        <div className="col-8"><input id="codevoucher" className="form-control" placeholder="Nhập mã giảm giá" /></div>
                                        <div className="col-4"><button onClick={() => loadVoucher()} className="btnmagg">Áp dụng</button></div>
                                        <div className="col-12" id="blockmess">
                                            <span className="successvou">Mã giảm giá đã được áp dụng</span>
                                        </div>
                                        <div className="col-12" id="blockmessErr">
                                            <br /><i className="fa fa-warning"> <span id="messerr">Mã giảm giá không khả dụng</span></i>
                                        </div>
                                    </div>
                                    <table className="table table-borderless">
                                        <tr>
                                            <td><span className="titlecheckout">Tạm tính</span></td>
                                            <td><span className="tongtienthanhtoan">{formatMoney(totalAmount)}</span></td>
                                        </tr>
                                        <tr>
                                            <td><span className="titlecheckout">Giảm giá</span></td>
                                            <td><span className="tongtienthanhtoan">{voucher == null ? 0 : formatMoney(voucher.discount)}</span></td>
                                        </tr>
                                        <tr>
                                            <td><span className="titlecheckout">Tổng tiền phải thanh toán</span></td>
                                            <td><span className="tongtienthanhtoan" id="tongtienthanhtoan">{formatMoney(totalAmount)}</span></td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button onClick={() => checkout()} type="button" className="btn btn-primary">Xác nhận đặt hàng</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PublicCart;
