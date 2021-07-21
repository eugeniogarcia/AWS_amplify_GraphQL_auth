import React, { FunctionComponent } from 'react'
import { Link } from 'react-router-dom'
import { Menu } from 'antd'
import { HomeOutlined, ProfileOutlined, FileProtectOutlined } from '@ant-design/icons'

type propiedades={
    current: string
}

const Nav: FunctionComponent<propiedades> = (props: propiedades) => {
    const current = props.current
    return (
        <div>
            <Menu selectedKeys={[current]} mode="horizontal">
                <Menu.Item key='home'>
                    <Link to={`/`}>
                        <HomeOutlined />Home
                    </Link>
                </Menu.Item>
                <Menu.Item key='profile'>
                    <Link to='/profile'>
                        <ProfileOutlined />Profile
                    </Link>
                </Menu.Item>
                <Menu.Item key='protected'>
                    <Link to='/protected'>
                        <FileProtectOutlined />Protected
                    </Link>
                </Menu.Item>
                <Menu.Item key='newprofile'>
                    <Link to='/newprofile'>
                        <ProfileOutlined />Profile (custom)
                    </Link>
                </Menu.Item>
                <Menu.Item key='monedas'>
                    <Link to='/monedas'>
                        <FileProtectOutlined />Monedas
                    </Link>
                </Menu.Item>
            </Menu>
        </div>
    )
}
export default Nav