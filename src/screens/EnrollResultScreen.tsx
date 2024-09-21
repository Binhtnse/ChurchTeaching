import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

interface ResultScrProps {
    childName: string;
  }

function EnrollResultScreen({ childName }: ResultScrProps) {
  const navigate = useNavigate();

  const handleToMainClick = () => {
    navigate('/');
  };

  return (
    <Result
      status="success"
      title="Đăng ký học giáo lý thành công!"
      subTitle={`Đăng ký thành công cho ${childName}. Vui lòng chờ xác nhận từ ban giáo lý.`}
      extra={[
          <Button type="primary" onClick={handleToMainClick}>
            Quay về trang chủ
          </Button>
      ]}
    />
  );
}

export default EnrollResultScreen;