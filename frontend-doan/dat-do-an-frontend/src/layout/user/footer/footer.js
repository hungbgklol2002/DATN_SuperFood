import logofooter from '../../../assest/images/footer.png'

function footer(){
    return(
      <div class="container" id="footer">
        <footer class="text-center text-lg-start text-muted">
        <section class="d-flex justify-content-center justify-content-lg-between p-4 border-bottom">
          <div class="me-5 d-none d-lg-block"><span><b>Theo dõi chúng tôi tại:</b></span></div>
          <div>
            <a href="" class="me-4 text-reset"><i class="fab fa-facebook-f"></i></a>
            <a href="" class="me-4 text-reset"><i class="fab fa-twitter"></i></a>
            <a href="" class="me-4 text-reset"><i class="fab fa-google"></i></a>
            <a href="" class="me-4 text-reset"><i class="fab fa-instagram"></i></a>
            <a href="" class="me-4 text-reset"><i class="fab fa-linkedin"></i></a>
            <a href="" class="me-4 text-reset"><i class="fab fa-github"></i></a>
          </div>
        </section>
        <section class="">
          <div class=" text-center text-md-start mt-5">
            <div class="row mt-3">
              <div class="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
                <h6 class="text-uppercase fw-bold mb-4"><i class="fa fa-mobile"></i> SuperFood</h6>
                <p>
                  Chúng tôi cung cấp các món ăn đồ uống ngon - bổ - rẻ , chất lượng cao và đảm bảo vệ sinh đến người tiêu dùng.
                </p>
              </div>
              <div class="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
                <h6 class="text-uppercase fw-bold mb-4">Về chúng tôi</h6>
                <p><a href="#!" class="text-reset">Hotline: 0965663431</a></p>
                <p><a href="#!" class="text-reset">Email: superfood@gmail.com</a></p>
                <p><a href="#!" class="text-reset">Địa chỉ cs1: Số 1, đại cồ việt, Hai Bà Trưng, Hà nội</a></p>
                <p><a href="#!" class="text-reset">Địa chỉ cs2: Số 45, Phố Nguyên Xá, Bắc Từ Liêm, Hà nội</a></p>
              </div>
              <div class="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
                <h6 class="text-uppercase fw-bold mb-4">Hỗ trợ khách hàng</h6>
                <p><a href="#!" class="text-reset">Uy tín</a></p>
                <p><a href="#!" class="text-reset">Chất lượng</a></p>
                <p><a href="#!" class="text-reset">Nguồn gốc rõ ràng</a></p>
                <p><a href="#!" class="text-reset">Giá rẻ</a></p>
              </div>
              <div class="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">
                <h6 class="text-uppercase fw-bold mb-4">Liên hệ</h6>
                <p><i class="fas fa-home me-3"></i> Hà nội, Việt Nam</p>
                <p><i class="fas fa-envelope me-3"></i> shop@gmail.com</p>
                <p><i class="fas fa-phone me-3"></i> + 0965663431</p>
                <p><i class="fas fa-print me-3"></i> + 01 234 567 89</p>
              </div>
            </div>
          </div>
        </section>
      </footer>
        </div>
    );
}

export default footer;