import React, { useState } from 'react'
import CSS from 'csstype';

import { Auth } from 'aws-amplify'
import SignIn from './SignIn'
import SignUp from './SignUp'
import ConfirmSignUp from './ConfirmSignUp'
import ForgotPassword from './ForgotPassword'
import ForgotPasswordSubmit from './ForgotPasswordSubmit'

import {usuario} from '../NewProfile'

type propiedadesIN = {
    setUser: React.Dispatch<React.SetStateAction<usuario>>,
}

export type propiedadesSingIn = {
    signIn: ()=>void,
    updateFormState: (x: React.ChangeEvent<HTMLInputElement>) => any,
}

export type propiedadesSingUp = {
    updateFormState: (x: React.ChangeEvent<HTMLInputElement>) => any,
    signUp: () => void,
}

export type propiedadesConfirmSignUp = {
    updateFormState: (x: React.ChangeEvent<HTMLInputElement>) => any,
    confirmSignUp: () => void,
}

export type propiedadesForgotPassword = {
    updateFormState: (x: React.ChangeEvent<HTMLInputElement>) => any,
    forgotPassword: () => void,
}

export type propiedadesForgotPasswordSubmit = {
    updateFormState: (x: React.ChangeEvent<HTMLInputElement>) => any,
    forgotPasswordSubmit: () => void,
}

type estado = {
    username: string,
    password: string,
    email: string,
    confirmationCode: string
}

const initialFormState = {
    username: '', password: '', email: '', confirmationCode: ''
} as estado

async function signIn({ username, password }: estado, setUser: React.Dispatch<React.SetStateAction<usuario>>) {
    try {
        const user = await Auth.signIn(username, password)
        const userInfo = { username: user.username, ...user.attributes }
        setUser(userInfo)
    } catch (err) {
        console.log('error signing up..', err)
    }
}

async function signUp({ username, password, email }: estado, updateFormType: React.Dispatch<React.SetStateAction<string>>) {
    try {
        await Auth.signUp({
            username, password, attributes: { email }
        })
        console.log('sign up success!')
        updateFormType('confirmSignUp')
    } catch (err) {
        console.log('error signing up..', err)
    }
}

async function confirmSignUp({ username, confirmationCode }: estado, updateFormType: React.Dispatch<React.SetStateAction<string>>) {
    try {
        await Auth.confirmSignUp(username, confirmationCode)
        updateFormType('signIn')
    } catch (err) {
        console.log('error signing up..', err)
    }
}

async function forgotPassword({ username }: estado, updateFormType: React.Dispatch<React.SetStateAction<string>>) {
    try {
        await Auth.forgotPassword(username)
        updateFormType('forgotPasswordSubmit')
    } catch (err) {
        console.log('error submitting username to reset password...', err)
    }
}

async function forgotPasswordSubmit(
    { username, confirmationCode, password }: estado, updateFormType: React.Dispatch<React.SetStateAction<string>>
) {
    try {
        await Auth.forgotPasswordSubmit(username, confirmationCode, password)
        updateFormType('signIn')
    } catch (err) {
        console.log('error updating password... :', err)
    }
}

function Form(props: propiedadesIN) {
    const [formType, updateFormType] = useState('signIn')
    
    const [formState, updateFormState] = useState(initialFormState)
    
    function updateForm(event: React.ChangeEvent<HTMLInputElement>) {
        const newFormState = {
            ...formState, [event.target.name]: event.target.value
        }

        updateFormState(newFormState)
    }

    function renderForm() {
        switch (formType) {
            case 'signUp':
                return (
                    <SignUp
                        signUp={() => signUp(formState, updateFormType)}
                        updateFormState={e => updateForm(e)}
                    />
                )
            case 'confirmSignUp':
                return (
                    <ConfirmSignUp
                        confirmSignUp={() => confirmSignUp(formState, updateFormType)}
                        updateFormState={e => updateForm(e)}
                    />
                )
            case 'signIn':
                return (
                    <SignIn
                        signIn={() => signIn(formState, props.setUser)}
                        updateFormState={e => updateForm(e)}
                    />
                )
            case 'forgotPassword':
                return (
                    <ForgotPassword
                        forgotPassword={() => forgotPassword(formState, updateFormType)}
                        updateFormState={e => updateForm(e)}
                    />
                )
            case 'forgotPasswordSubmit':
                return (
                    <ForgotPasswordSubmit
                        forgotPasswordSubmit={
                            () => forgotPasswordSubmit(formState, updateFormType)}
                        updateFormState={e => updateForm(e)}
                    />
                )
            default:
                return null
        }
    }
    
    return (
        <div>
            {renderForm()}
            {
                formType === 'signUp' && (
                    <p style={styles.toggleForm}>
                        Already have an account? <span
                            style={styles.anchor}
                            onClick={() => updateFormType('signIn')}
                        >Sign In</span>
                    </p>
                )
            }
            {
                formType === 'signIn' && (
                    <>
                        <p style={styles.toggleForm}>
                            Need an account? <span
                                style={styles.anchor}
                                onClick={() => updateFormType('signUp')}
                            >Sign Up</span>
                        </p>
                        <p style={{ ...styles.toggleForm, ...styles.resetPassword }}>
                            Forget your password? <span
                                style={styles.anchor}
                                onClick={() => updateFormType('forgotPassword')}
                            >Reset Password</span>
                        </p>
                    </>
                )
            }
        </div>
    )
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: '150',
        justifyContent: 'center',
        alignItems: 'center'
    } as CSS.Properties,
    input: {
        height: '45',
        marginTop: '8',
        width: '300',
        maxWidth: '300',
        padding: '0px 8px',
        fontSize: '16',
        outline: 'none',
        border: 'none',
        borderBottom: '2px solid rgba(0, 0, 0, .3)'
    } as CSS.Properties,
    toggleForm: {
        fontweight: '600',
        padding: '0px 25px',
        marginTop: '15px',
        marginBottom: '0',
        textAlign: 'center',
        color: 'rgba(0, 0, 0, 0.6)'
    } as CSS.Properties,
    resetPassword: {
        marginTop: '5px',
    } as CSS.Properties,
    anchor: {
        color: '#006bfc',
        cursor: 'pointer'
    } as CSS.Properties
}

export { styles, Form as default }