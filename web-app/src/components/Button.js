import React from 'react';

export default class Button extends React.Component {
    state = {
        hover: false
    }
    onMouseEnter() {
        this.setState({hover: true});
    }
    
    onMouseLeave() {
        this.setState({hover: false});
    }

    render() {
        return <div style={{        
                display: 'flex', 
                alignItems: 'center', 
                textAlign: 'center',
                // padding: '8px 12px', 
                transform: this.state.hover && 'scale(1.03)',
                boxShadow: this.state.hover && "2px 3px 10px rgba(0, 0, 0, 0.1)",
                transition: '0.2s',
                cursor: 'pointer',        
                ...this.props.style
            }}
            className={this.props.className}
            onMouseEnter={this.onMouseEnter.bind(this)} 
            onMouseLeave={this.onMouseLeave.bind(this)}
            onClick={this.props.onClick}
        >
            {this.props.children}
        </div>
    }
}