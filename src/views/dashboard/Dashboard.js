import React, { lazy } from 'react';

import {
  CBadge,
  // CButton,
  // CButtonGroup,
  CCard,
  CCardBody,
  // CCardFooter,
  CCardHeader,
  CCol,
  // CProgress,
  CRow,
  // CCallout,
  CDataTable,
} from '@coreui/react'
import {
  CWidgetDropdown,
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CDropdownToggle
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import ChartLineSimple from '../charts/ChartLineSimple'
import ChartBarSimple from '../charts/ChartBarSimple'

const axios = require('axios');
// const WidgetsDropdown = lazy(() => import('../widgets/WidgetsDropdown.js'))
const fields = ['No', 'name', 'rating', 'collection_power', 'ecr', 'ecr_current', 'last_reward_time', 'dec'];

const getBadge = status => {
  switch (status) {
    case 'Active': return 'success'
    case 'Inactive': return 'secondary'
    case 'Pending': return 'warning'
    case 'Banned': return 'danger'
    default: return 'primary'
  }
}

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = { accounts: [] };
  }

  async componentDidMount() {
    var envAccounts = process.env.REACT_APP_ACCOUNTS;

    if (envAccounts == undefined || envAccounts.length == 0) {
      console.log("Please set to 'USERNAME' .env...");
      return;
    }
    const [...accounts] = envAccounts.split(',');

    accounts.sort(function (a, b) { return a - b }).forEach(async (account, i) => {
      let [detailResponse, balanceResponse] = await Promise.all([
        axios.get(`https://api.splinterlands.io/players/details?name=${account}`),
        axios.get(`https://api.splinterlands.io/players/balances?username=${account}`)
      ]);

      let indexDEC = 0;
      let indexECR = 0;
      for (let index = 0; index < balanceResponse.data.length; index++) {
        const element = balanceResponse.data[index];
        if (element.token == "DEC") {
          indexDEC = index;
          continue;
        }
        if (element.token == "ECR") {
          indexECR = index;
          continue;
        }
      }
      let data = {
        ...detailResponse.data,
        ...{
          dec: balanceResponse.data[indexDEC].balance,
          No: i + 1,
          ecr: balanceResponse.data[indexECR].balance,
          ecr_current: ((detailResponse.data.capture_rate / 100) + ((new Date() - new Date(balanceResponse.data[indexECR].last_reward_time)) / (1000 * 60 * 60) * 1.041)).toFixed(2),
          last_reward_time: balanceResponse.data[indexECR].last_reward_time
        }
      };
      await this.setState({
        accounts: [...this.state.accounts, data]
      });
    });
  }

  timeSince(date) {
    var seconds = Math.floor((new Date() - date) / 1000);
    var interval = seconds / 31536000;

    if (interval > 1) {
      return Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
  }

  render() {
    return (
      <>
        {/* <WidgetsDropdown /> */}
        <CRow>
          <CCol sm="6" lg="3">
            <CWidgetDropdown
              color="gradient-primary"
              header={this.state.accounts.length.toString()}
              text="Total Accounts"
              footerSlot={
                <ChartLineSimple
                  pointed
                  className="c-chart-wrapper mt-3 mx-3"
                  style={{ height: '70px' }}
                  dataPoints={[65, 59, 84, 84, 51, 55, 40]}
                  pointHoverBackgroundColor="primary"
                  label="Members"
                  labels="months"
                />
              }
            >
            </CWidgetDropdown>
          </CCol>

          <CCol sm="6" lg="3">
            <CWidgetDropdown
              color="gradient-info"
              header={this.state.accounts.filter(item => item.collection_power < process.env.REACT_APP_CP_ALERT).length}
              text={'Accounts CP < ' + process.env.REACT_APP_CP_ALERT + ' CP'}
              footerSlot={
                <ChartLineSimple
                  pointed
                  className="mt-3 mx-3"
                  style={{ height: '70px' }}
                  dataPoints={[1, 18, 9, 17, 34, 22, 11]}
                  pointHoverBackgroundColor="info"
                  options={{ elements: { line: { tension: 0.00001 } } }}
                  label="Members"
                  labels="months"
                />
              }
            >
            </CWidgetDropdown>
          </CCol>

          <CCol sm="6" lg="3">
            <CWidgetDropdown
              color="gradient-warning"
              header={this.state.accounts.filter(item => ((item.capture_rate / 100) + ((new Date() - new Date(item.last_reward_time)) / (1000 * 60 * 60) * 1.041)).toFixed(2) >= 90).length}
              text={'Enery Capture Rate >= ' + process.env.REACT_APP_ERC_HIGH + '% '}
              footerSlot={
                <ChartLineSimple
                  className="mt-3"
                  style={{ height: '70px' }}
                  backgroundColor="rgba(255,255,255,.2)"
                  dataPoints={[78, 81, 80, 45, 34, 12, 40]}
                  options={{ elements: { line: { borderWidth: 2.5 } } }}
                  pointHoverBackgroundColor="warning"
                  label="Members"
                  labels="months"
                />
              }
            >
            </CWidgetDropdown>
          </CCol>

          <CCol sm="6" lg="3">
            <CWidgetDropdown
              color="gradient-danger"
              header={this.state.accounts.reduce((a, b) => +a + +b.dec, 0).toString()}
              text="Total DEC"
              footerSlot={
                <ChartLineSimple
                  className="mt-3"
                  style={{ height: '70px' }}
                  backgroundColor="rgba(255,255,255,.2)"
                  dataPoints={[78, 81, 80, 45, 34, 12, 40]}
                  options={{ elements: { line: { borderWidth: 2.5 } } }}
                  pointHoverBackgroundColor="danger"
                  label="Members"
                  labels="months"
                />
              }
            >
            </CWidgetDropdown>
          </CCol>
        </CRow>

        <CRow>
          <CCol xs="12" lg="12">
            <CCard>
              <CCardHeader>
                Accounts Datatable
              </CCardHeader>
              <CCardBody>
                <CDataTable
                  items={this.state.accounts}
                  fields={fields}
                  striped
                  itemsPerPage={10}
                  pagination
                  columnFilter
                  tableFilter
                  sorter
                  hover
                  scopedSlots={{
                    'name':
                      (item) => (
                        <td>
                          <strong>{item.name}</strong>
                        </td>
                      ),
                    'status':
                      (item) => (
                        <td>
                          <CBadge color={getBadge(item.status)}>
                            {item.status}
                          </CBadge>
                        </td>
                      ),
                    'collection_power':
                      (item) => (
                        <td>
                          {item.collection_power < process.env.REACT_APP_CP_ALERT ? <div className="text-value text-danger">{item.collection_power}</div> : <div className="text-value text-success">{item.collection_power}</div>}
                        </td>
                      ),
                    'ecr':
                      (item) => (
                        <td>
                          {item.capture_rate < process.env.REACT_APP_ERC_ALERT * 100 ? <div className="text-value text-danger">{item.capture_rate / 100}%</div> : <div className="text-value text-success">{item.capture_rate / 100}%</div>}
                        </td>
                      ),
                    'ecr_current':
                      (item) => (
                        <td>
                          {/* <div className="text-value text-success">{((item.capture_rate / 100) + ((new Date() - new Date(item.last_reward_time)) / (1000 * 60 * 60) * 1.041)).toFixed(2)}%</div> */}
                          <div className="text-value text-success">{item.ecr_current}%</div>
                        </td>
                      ),
                    'dec':
                      (item) => (
                        <td>
                          <div className="text-value text-success">{item.dec}</div>
                        </td>
                      ),
                    'last_reward_time':
                      (item) => (
                        <td>
                          <p>{this.timeSince(new Date(item.last_reward_time))}</p>
                        </td>
                      ),
                  }}
                />
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </>
    )
  }
}

// const Dashboard = () => {

// }
