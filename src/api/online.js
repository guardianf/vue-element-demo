import request from '../utils/request_file'
/**
 * 获取项目
 * @returns Promise
 */
export const getProjects = (params) => {
  return request({
    url: '/projects',
    method: 'get',
    params
  })
}

/**
 * 更新项目缩略图
 * @param {Object} params 参数
 * @param.id {Int} 项目ID
 * @param.file {File} 缩略图文件
 * @returns Promise
 */
export const uploadThumbnail = (params) => {
  const { id, file } = params
  const form = new FormData()
  form.append('file', file)
  return request({
    url: `/projects/${id}/uploadimage`,
    method: 'post',
    data: form
  })
}

export const getProject = id => {
  return request({
    url: `/projects/${id}`,
    method: 'get'
  })
}

export const deleteProject = id => {
  return request({
    url: `/projects/${id}`,
    method: 'delete'
  })
}

export const getProjectFileConstruction = id => {
  return request({
    url: `/constructions/${id}`,
    method: 'get'
  })
}

export const updateProjectFileConstruction = (id, data) => {
  return request({
    url: `/constructions/${id}`,
    method: 'post',
    data
  })
}

export const getGroupByProjectId = id => {
  return request({
    url: `/constructions/${id}/groups`,
    method: 'get'
  })
}

export const getTypeByProjectAndGroup = (project, group) => {
  return request({
    url: `/constructions/${project}/groups/${group}`,
    method: 'get'
  })
}

export const getFileLimit = (project, group, type) => {
  return request({
    url: `/constructions/${project}/groups/${group}/types/${type}/limit`,
    method: 'get'
  })
}

export const getPsnls = () => {
  return request({
    url: '/persons',
    method: 'get'
  })
}

export const getMimetypes = () => {
  return request({
    url: '/mimetypes',
    method: 'get'
  })
}

export const uploadFile = (data) => {
  const form = new FormData()
  for (const key in data) {
    form.append(key, data[key])
  }
  return request({
    url: `/constructions/upload`,
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: form
  })
}

export const getBatchDownload = ids => {
  return request({
    url: `/download`,
    method: 'post',
    data: ids,
    responseType: 'blob'
  })
}
