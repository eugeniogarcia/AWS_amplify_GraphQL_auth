import React, { FunctionComponent } from 'react'
import CSS from 'csstype';

const Container: FunctionComponent = ({ children }) => (
    <div style={styles.container}>
        {children}
    </div>
)

const styles = {
    container: {
        margin: '0 auto',
        padding: '50px 100px'
    } as CSS.Properties
}

export default Container