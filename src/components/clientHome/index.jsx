import React, { Component, Fragment } from 'react';
import moment from 'moment';
import { Tag, Modal, message } from 'antd';
import { connect } from 'react-redux';
import TextArea from '../textArea';
import { faSpinner, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { handleSendRequest } from '../../actions/requests';

class ClientHome extends Component {
  state = {
    modal1Visible: false,
    selectedRecord: null,
    modal2Visible: false,
    loading: false,
    description: '',
    errors: {
      description: '',
    },
    errorMessage: '',
  };

  handleDescription = (e) => {
    const { errors } = this.state;
    errors.description = '';
    this.setState({ errors, description: e.target.value, errorMessage: '' });
  };

  handleNewRequest = () => {
    const { data, response } = this.checkValidation();
    if (response) {
      this.setState({ loading: true, errorMessage: '' });

      this.props.dispatch(handleSendRequest(data)).then((res) => {
        this.setState({ loading: false });

        if (res.type !== 'LOG_ERROR') {
          message.success('Request sent successfully');
          this.setState({ modal2Visible: false, description: '' });
        } else this.setState({ errorMessage: res.error });
      });
    }
  };

  checkValidation = () => {
    const { description, errors } = this.state;

    let response = true;

    const data = { description };

    if (!description) {
      errors.description = 'Description is required';
      response = false;
    }
    this.setState({ errors });

    return { data, response };
  };

  tagThis = (status) => {
    switch (status) {
      case 'pending':
        return <Tag color="gold">{status.toUpperCase()}</Tag>;
        break;
      case 'processing':
        return <Tag color="blue">{status.toUpperCase()}</Tag>;
        break;
      case 'completed':
        return <Tag color="green">{status.toUpperCase()}</Tag>;
        break;

      default:
        return <Tag color="gold">{status.toUpperCase()}</Tag>;
        break;
    }
  };

  render() {
    const { requests } = this.props;
    const {
      modal1Visible,
      modal2Visible,
      selectedRecord,
      description,
      errors,
      loading,
      errorMessage,
    } = this.state;
    return (
      <Fragment>
        <Modal
          title="Request details"
          centered
          visible={this.state.modal1Visible}
          footer={null}
          onCancel={() => this.setState({ modal1Visible: false })}
        >
          {selectedRecord && (
            <div>
              <div className="request-description mb-3">
                <span className="data-holder-label">Description:</span>
                <span className="data-holder-value">
                  {selectedRecord.description}
                </span>
              </div>
              <div className="request-description mb-3">
                <span className="data-holder-label">Technician Note:</span>
                <span className="data-holder-value">
                  {selectedRecord.technicianNote}
                </span>
              </div>
            </div>
          )}
        </Modal>
        <Modal
          title="New Request"
          centered
          visible={this.state.modal2Visible}
          footer={null}
          onCancel={() => this.setState({ modal2Visible: false })}
        >
          {errorMessage && (
            <div className="error-message-container">
              <div className="d-flex">
                <div>
                  <FontAwesomeIcon
                    icon={faTimesCircle}
                    size="1x"
                    color="#485056"
                    className="error-icon"
                  />
                </div>
                <div>
                  <span className="error-title">Error</span>
                </div>
              </div>
              <div>
                <span className="error-label">{errorMessage}</span>
              </div>
            </div>
          )}
          <TextArea
            type="text"
            placeholder="description"
            value={description}
            name="email"
            onChange={this.handleDescription}
            errorMessage={errors.description}
          />
          <button
            className="btn btn-primary btn-block custom-btn"
            disabled={description === ''}
            onClick={this.handleNewRequest}
          >
            {loading ? (
              <FontAwesomeIcon
                icon={faSpinner}
                size="2x"
                color="#fff"
                className="ml-2"
              />
            ) : (
              'Send'
            )}
          </button>
        </Modal>
        <div className="client-container">
          <div className="section-header">
            <div>
              <span className="header-title">
                {requests && requests.length !== 0
                  ? 'My Requests'
                  : 'Nothing to show here'}
              </span>
            </div>
            <div>
              <button
                className="btn btn-primary btn-block custom-btn request-btn"
                onClick={() =>
                  this.setState({
                    modal2Visible: true,
                  })
                }
              >
                New Request
              </button>
            </div>
          </div>
          <div className="section-body">
            {requests &&
              requests.length !== 0 &&
              requests.map((request, index) => (
                <div
                  className="user-request-card"
                  key={index}
                  onClick={() =>
                    this.setState({
                      modal1Visible: true,
                      selectedRecord: request,
                    })
                  }
                >
                  <div className="request-description">
                    <span className="data-holder-label">Description:</span>
                    <span className="data-holder-value">
                      {request.description}
                    </span>
                  </div>
                  <div className="request-footer">
                    <div className="request-time">
                      <span className="time-holder-label">Sent</span>
                      <span className="time-holder-value">
                        {moment(request.createdAt).fromNow()}
                      </span>
                    </div>
                    <div className="tag-holder">
                      {this.tagThis(request.status)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </Fragment>
    );
  }
}

const mapStateToProps = ({ authedUser, requests }) => {
  return {
    authedUser,
    requests:
      requests &&
      Object.values(requests)
        .filter((request) => request.userId === authedUser.id)
        // filtering is just a solution due to rush will be resolved on backend
        .reverse(),
  };
};

export default connect(mapStateToProps)(ClientHome);
