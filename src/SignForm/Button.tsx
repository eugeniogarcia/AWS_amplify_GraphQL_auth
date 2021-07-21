import React, { MouseEventHandler}from 'react'
import CSS from 'csstype';


export default function Button({ onClick, title }: { onClick: MouseEventHandler<HTMLButtonElement>,title:string}) {
    return (
        <button style={styles.button} onClick={onClick}>
            {title}
        </button>
    )
}

const styles = {
    button: { 
        backgroundColor: '#006bfc',
        color: 'white',
        width: '316',
        height: '45',
        fontweight: '600',
        fontsize: 14,
        cursor: 'pointer',
        border: 'none',
        outline: 'none',
        borderRadius: '3',
        marginTop: '25px',
        boxShadow: '0px 1px 3px rgba(0, 0, 0, .3)',
    } as CSS.Properties,
}
