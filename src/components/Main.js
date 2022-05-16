import React, { Component } from 'react'

class Main extends Component {

  render() {
    return (
      <div id="content" className="mt-3">

        <table className="table table-borderless text-muted text-center">
          <thead>
            <tr>
              <th scope="col">质押余额</th>
              <th scope="col">奖励余额</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{window.web3.utils.fromWei(this.props.stakingBalance, 'Ether')} LP</td>
              <td>
                {window.web3.utils.fromWei(this.props.queryIssueBalance, 'Ether')} WMS
                <button
                  type="submit"
                  className="btn btn-link btn-block btn-sm"
                  onClick={(event) => {
                    event.preventDefault()
                    this.props.queryTokens()
                  }}>
                  查询奖励
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="card mb-4" >

          <div className="card-body">

            <form className="mb-3" onSubmit={(event) => {
              event.preventDefault()
              let amount
              let addressLP;
              amount = this.input2.value.toString()
              amount = window.web3.utils.toWei(amount, 'Ether')
              addressLP = this.input1.value.toString()
              this.props.stakeTokens(addressLP, amount)
            }}>
              <div>
                <label className="float-left"><b>LP地址</b></label>
              </div>
              <div className="input-group mb-4">
                <input
                  type="text"
                  ref={(input1) => { this.input1 = input1 }}
                  className="form-control form-control-lg"
                  placeholder="0x"
                  required />
              </div>
              <div>
                <label className="float-left"><b>质押数量</b></label>
              </div>
              <div className="input-group mb-4">
                <input
                  type="text"
                  ref={(input2) => { this.input2 = input2 }}
                  className="form-control form-control-lg"
                  placeholder="0"
                  required />
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-lg">质押</button>
            </form>
            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              onClick={(event) => {
                event.preventDefault()
                this.props.unstakeTokens()
              }}>
              取出质押
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              onClick={(event) => {
                event.preventDefault()
                this.props.issueTokens()
              }}>
              提取奖励
            </button>
          </div>
        </div>

      </div>
    );
  }
}

export default Main;
