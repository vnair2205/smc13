import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';
import logo from '../assets/seekmycourse_logo.png'; // We'll add this asset
import loginBanner from '../assets/SMC_Login_Banner.png'; // And this one

// --- Styled Components (from your client app) ---
const PageContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
`;

const FormContainer = styled.div`
  width: 30%;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
  @media (max-width: 768px) {
    width: 100%;
    padding: 2rem;
  }
`;

const BannerContainer = styled.div`
  width: 70%;
  background-image: url(${loginBanner});
  background-size: cover;
  background-position: center;
  @media (max-width: 768px) {
    display: none;
  }
`;

const Logo = styled.img`
  width: 250px;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Subtitle = styled.p`
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const FormWrapper = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  background-color: #33333e;
  border: 1px solid #444;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const PasswordIcon = styled.div`
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SignInButton = styled.button`
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    opacity: 0.9;
  }
`;

const ForgotPasswordLink = styled(Link)`
  align-self: flex-end;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const FormErrorText = styled.p`
    color: ${({ theme }) => theme.colors.error};
    margin-bottom: 1rem;
    text-align: center;
`;

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { email, password } = formData;
  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/admin/login', { email, password });
      localStorage.setItem('adminToken', res.data.token);
      navigate('/');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <PageContainer>
      <FormContainer>
        <Logo src={logo} alt="SeekMYCOURSE Logo" />
        <Title>Admin Panel</Title>
        <Subtitle>Sign in to continue</Subtitle>
        <FormErrorText>{error}</FormErrorText>
        <FormWrapper onSubmit={onSubmit}>
          <InputGroup>
            <Input
              type="email"
              placeholder="Email"
              name="email"
              value={email}
              onChange={onChange}
              required
            />
          </InputGroup>
          <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              name="password"
              value={password}
              onChange={onChange}
              required
            />
            <PasswordIcon onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </PasswordIcon>
          </InputGroup>
          <ForgotPasswordLink to="/forgot-password">
            Forgot Password?
          </ForgotPasswordLink>
          <SignInButton type="submit">Sign In</SignInButton>
        </FormWrapper>
      </FormContainer>
      <BannerContainer />
    </PageContainer>
  );
};

export default LoginPage;