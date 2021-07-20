import React, { useState, useEffect, FunctionComponent } from 'react'
import { Auth } from 'aws-amplify'
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'
import Container from './Container'

type perfil={
    username: string,
    email?: string,
    phone_number?:string
}

const Profile:FunctionComponent =function () {
    useEffect(() => {
        checkUser()
    }, [])

    const [user, setUser] = useState({} as perfil)

    async function checkUser() {
        try {
            const data = await Auth.currentUserPoolUser()
            const userInfo = { username: data.username, ...data.attributes, }
            setUser(userInfo)
        } catch (err) { console.log('error: ', err) }
    }

    return (
        <Container>
            <h1>Profile</h1>
            <h2>Username: {user.username}</h2>
            <h3>Email: {user.email}</h3>
            <h4>Phone: {user.phone_number}</h4>
            <AmplifySignOut />
        </Container>
    );
}

export default withAuthenticator(Profile)