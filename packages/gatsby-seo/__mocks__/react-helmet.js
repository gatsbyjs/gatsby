const Helmet = jest.fn().mockImplementation(() => null)

export default jest.fn().mockImplementation(Helmet)
