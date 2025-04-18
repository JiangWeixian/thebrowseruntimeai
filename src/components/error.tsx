import React from 'react'

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    self.__THEBROWSERRUNTIMEAI__.error(error.message)
    return { hasError: true }
  }

  componentDidCatch(error: Error, _errorInfo: React.ErrorInfo) {
    self.__THEBROWSERRUNTIMEAI__.error(error.message)
  }

  render() {
    return this.props.children
  }
}
