import { Avatar, Icon, Menu, Spin } from 'antd';
import { ClickParam } from 'antd/es/menu';
import React from 'react';
import router from 'umi/router';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import { userStorage } from '@/utils/user.storage';

class AvatarDropdown extends React.Component<any, any> {
  onMenuClick = (event: ClickParam) => {
    const { key } = event;
    if (key === 'logout') {
      localStorage.clear();
      sessionStorage.clear();
      router.push('/login?redirect=' + encodeURIComponent(window.location.href));
      return;
    }
    router.push(`/account/${key}`);
  };

  render(): React.ReactNode {

    const currentUser = userStorage.CurrentUser;

    const menuHeaderDropdown = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={this.onMenuClick}>
        <Menu.Item key="center">
          <Icon type="user" />
          个人中心
        </Menu.Item>
        <Menu.Item key="settings">
          <Icon type="setting" />
          个人设置
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="logout">
          <Icon type="logout" />
          退出登录
        </Menu.Item>
      </Menu>
    );

    return currentUser && currentUser.UserName ? (
      <HeaderDropdown overlay={menuHeaderDropdown}>
        <span className={`${styles.action} ${styles.account}`}>
          <Avatar size="small" className={styles.avatar} src={currentUser.Avatar} alt="avatar" />
          <span className={styles.name}>{currentUser.UserName}</span>
        </span>
      </HeaderDropdown>
    ) : (
        <Spin size="small" style={{ marginLeft: 8, marginRight: 8 }} />
      );
  }
}
export default AvatarDropdown;
