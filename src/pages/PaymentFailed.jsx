const PaymentFailed = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-red-600">
        ❌ Thanh toán thất bại!
      </h1>
      <p>Đã xảy ra lỗi khi xử lý thanh toán. Vui lòng thử lại.</p>
    </div>
  );
};

export default PaymentFailed;
